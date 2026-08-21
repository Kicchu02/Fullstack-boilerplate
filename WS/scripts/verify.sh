#!/bin/bash
# Verifies the backend end to end: schema, codegen, build, format, tests, the emitted
# bytecode target, and every endpoint against a live database.
#
# Deliberately does NOT use `set -e`. Every check runs and the failures are summarised at
# the end, because "which checks failed" is far more useful than "the first one did".
set -uo pipefail

# Run from WS/ regardless of the caller's working directory, so that docker-compose.yml,
# ./gradlew and the paths inside build.gradle.kts all resolve.
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."

# shellcheck source=lib/preflight.sh
source ./scripts/lib/preflight.sh
# shellcheck source=lib/db.sh
source ./scripts/lib/db.sh
require_no_sudo
require_docker
require_java

LOG="build/verify.log"          # inside build/, which is gitignored
SRV_LOG="build/verify-server.log"
PID_FILE="build/verify-server.pid"
mkdir -p build
: > "$LOG"

FAILED=0
declare -a RESULTS=()
pass() { RESULTS+=("PASS  $1"); echo "PASS  $1"; }
fail() { RESULTS+=("FAIL  $1"); echo "FAIL  $1"; FAILED=1; }
info() { echo "----- $1"; }

# Returns the command's exit status so callers can gate later checks on it.
run() { # run <label> <cmd...>
  local label="$1"; shift
  info "$label"
  if "$@" >>"$LOG" 2>&1; then
    pass "$label"
    return 0
  fi
  fail "$label (see WS/$LOG)"
  tail -25 "$LOG"
  return 1
}

# The bytecode target is derived from the java pin rather than hardcoded, so this check
# keeps working after a JDK bump instead of needing to be remembered. Class file major
# version is the Java feature release + 44 (Java 21 -> 65, Java 25 -> 69).
JAVA_PIN=$(sed -n 's/^java = "temurin-\([0-9]*\).*/\1/p' ../.mise.toml)
EXPECTED_MAJOR=$(( JAVA_PIN + 44 ))

cleanup() {
  if [ -f "$PID_FILE" ]; then
    local p; p=$(cat "$PID_FILE" 2>/dev/null || true)
    [ -n "${p:-}" ] && kill "$p" 2>/dev/null
    rm -f "$PID_FILE"
  fi
}
trap cleanup EXIT

# ---------- 1. database, schema, codegen ----------
info "docker compose up"
if docker compose up -d >>"$LOG" 2>&1; then pass "docker compose up"; else fail "docker compose up"; fi

info "waiting for the database"
if wait_for_db 60; then pass "database reachable"; else fail "database never became ready"; fi

run "gradlew flywayMigrate" ./gradlew flywayMigrate --console=plain
run "gradlew generateJooq"  ./gradlew generateJooq  --console=plain

JOOQ_FILES=$(find jooq/src -name '*.kt' 2>/dev/null | wc -l | tr -d ' ')
if [ "${JOOQ_FILES:-0}" -ge 20 ]; then
  pass "jooq codegen produced $JOOQ_FILES sources"
else
  fail "jooq codegen produced only ${JOOQ_FILES:-0} sources (expected >= 20)"
fi

# ---------- 2. build, format, tests ----------
BUILD_OK=0
run "gradlew clean build" ./gradlew clean build --console=plain || BUILD_OK=1
# --rerun-tasks so a cached PASS can never stand in for a real one: ktlint embeds its own
# Kotlin compiler and is the component most likely to break on a toolchain bump.
run "gradlew spotlessCheck (forced)" ./gradlew spotlessCheck --rerun-tasks --console=plain
run "gradlew test" ./gradlew test --console=plain

# ---------- 3. the toolchain actually took effect ----------
# Gated on the build: if `clean build` failed at configuration time then `clean` never ran
# either, so build/classes still holds the PREVIOUS build's output. Reading that would
# report the old bytecode target as the current one — a false pass, which is worse than no
# check at all.
CLASSFILE=$(find build/classes/kotlin/main -name 'ApplicationKt.class' 2>/dev/null | head -1)
if [ "$BUILD_OK" != 0 ]; then
  fail "bytecode target not checked — the build failed, so any class files are stale"
elif [ -n "$CLASSFILE" ]; then
  MAJOR=$(od -An -t u1 -j 6 -N 2 "$CLASSFILE" | awk '{print $1*256 + $2}')
  if [ "$MAJOR" = "$EXPECTED_MAJOR" ]; then
    pass "bytecode major $MAJOR matches the Java $JAVA_PIN pin"
  else
    fail "bytecode major $MAJOR but .mise.toml pins Java $JAVA_PIN (expected $EXPECTED_MAJOR)"
  fi
else
  fail "no compiled ApplicationKt.class found"
fi

# ---------- 4. boot the packaged application ----------
# A server left over from an earlier run would bind the port, the one started below would
# die quietly, and every endpoint check would then interrogate the OLD build — reporting
# stale behaviour as current. Refuse to guess.
if (ss -ltn 2>/dev/null || netstat -an 2>/dev/null) | grep -qE '[.:]8080[[:space:]]'; then
  fail "port 8080 is already in use — endpoint checks would hit a stale server"
else
  run "gradlew installDist" ./gradlew installDist --console=plain
  info "starting the packaged server"
  ./build/install/ktor-sample/bin/ktor-sample configuration/application.conf >"$SRV_LOG" 2>&1 &
  echo $! > "$PID_FILE"
  SRV_PID=$(cat "$PID_FILE")

  UP=0
  for _ in $(seq 1 60); do
    curl -s -o /dev/null --max-time 2 -X POST http://localhost:8080/user/signUp \
      -H 'Content-Type: application/json' -d '{}' 2>/dev/null && { UP=1; break; }
    kill -0 "$SRV_PID" 2>/dev/null || break
    sleep 1
  done

  if [ "$UP" != 1 ]; then
    fail "server did not start on :8080"
    tail -40 "$SRV_LOG"
  else
    pass "server listening on :8080"

    # ---------- 5. endpoint contract ----------
    # Bodies are asserted, not just status codes: a 200 carrying the wrong payload is a
    # failure, and serialization regressions show up here and nowhere else.
    EMAIL="verify+$(date +%s)$RANDOM@example.com"
    PW='Passw0rd!'
    BODY="{\"emailId\":{\"emailId\":\"$EMAIL\"},\"password\":\"$PW\"}"
    api() { curl -s -w '\n%{http_code}' --max-time 10 "$@"; }

    R=$(api -X POST http://localhost:8080/user/signUp -H 'Content-Type: application/json' -d "$BODY")
    CODE=$(echo "$R" | tail -1); PAY=$(echo "$R" | sed '$d')
    if [ "$CODE" = 200 ] && echo "$PAY" | grep -q '"userId"'; then
      pass "POST /user/signUp -> 200 with userId"
    else fail "POST /user/signUp -> $CODE $PAY"; fi

    R=$(api -X POST http://localhost:8080/user/signIn -H 'Content-Type: application/json' -d "$BODY")
    CODE=$(echo "$R" | tail -1); PAY=$(echo "$R" | sed '$d')
    TOKEN=$(echo "$PAY" | sed -n 's/.*"webToken":"\([^"]*\)".*/\1/p')
    if [ "$CODE" = 200 ] && [ -n "$TOKEN" ]; then
      pass "POST /user/signIn -> 200 with webToken"
    else fail "POST /user/signIn -> $CODE $PAY"; fi

    R=$(api -X POST http://localhost:8080/dummy/dummy -H 'Content-Type: application/json' -H "WebToken: $TOKEN" -d '{}')
    CODE=$(echo "$R" | tail -1); PAY=$(echo "$R" | sed '$d')
    if [ "$CODE" = 200 ] && echo "$PAY" | grep -q 'Dummy API. UserId'; then
      pass "POST /dummy/dummy (authenticated) -> 200 with message"
    else fail "POST /dummy/dummy (authenticated) -> $CODE $PAY"; fi

    CODE=$(api -X POST http://localhost:8080/dummy/dummy -H 'Content-Type: application/json' -d '{}' | tail -1)
    [ "$CODE" = 401 ] && pass "POST /dummy/dummy (no token) -> 401" \
      || fail "POST /dummy/dummy (no token) -> $CODE (expected 401)"

    CODE=$(api -X POST http://localhost:8080/user/signOut -H 'Content-Type: application/json' -H "WebToken: $TOKEN" -d '{}' | tail -1)
    [ "$CODE" = 200 ] && pass "POST /user/signOut -> 200" || fail "POST /user/signOut -> $CODE"

    R=$(api -X POST http://localhost:8080/dummy/dummy -H 'Content-Type: application/json' -H "WebToken: $TOKEN" -d '{}')
    CODE=$(echo "$R" | tail -1); PAY=$(echo "$R" | sed '$d')
    if [ "$CODE" = 401 ] && echo "$PAY" | grep -qi 'Invalid or expired web token'; then
      pass "POST /dummy/dummy (revoked token) -> 401 Invalid or expired"
    else fail "POST /dummy/dummy (revoked token) -> $CODE $PAY"; fi

    CODE=$(api -X POST http://localhost:8080/user/signUp -H 'Content-Type: application/json' -d "$BODY" | tail -1)
    [ "$CODE" = 409 ] && pass "POST /user/signUp duplicate -> 409" \
      || fail "POST /user/signUp duplicate -> $CODE (expected 409)"

    CODE=$(api -X POST http://localhost:8080/user/signIn -H 'Content-Type: application/json' \
      -d "{\"emailId\":{\"emailId\":\"$EMAIL\"},\"password\":\"WrongPass1!\"}" | tail -1)
    [ "$CODE" = 401 ] && pass "POST /user/signIn wrong password -> 401" \
      || fail "POST /user/signIn wrong password -> $CODE (expected 401)"

    # The minimum length is inclusive; an 8 character password meeting the other rules
    # must be accepted. Guards the off-by-one that used to make 9 the real minimum.
    CODE=$(api -X POST http://localhost:8080/user/signUp -H 'Content-Type: application/json' \
      -d "{\"emailId\":{\"emailId\":\"len8+$(date +%s)$RANDOM@example.com\"},\"password\":\"Passw0r!\"}" | tail -1)
    [ "$CODE" = 200 ] && pass "POST /user/signUp with an 8-char password -> 200" \
      || fail "POST /user/signUp with an 8-char password -> $CODE (expected 200)"

    CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 -X OPTIONS http://localhost:8080/user/signIn \
      -H 'Origin: http://localhost:3000' -H 'Access-Control-Request-Method: POST')
    [ "$CODE" = 200 ] && pass "CORS preflight from localhost:3000 -> 200" \
      || fail "CORS preflight from localhost:3000 -> $CODE"
  fi
fi

echo
echo "================ WS VERIFY SUMMARY ================"
printf '%s\n' "${RESULTS[@]}"
echo "==================================================="
if [ "$FAILED" = 0 ]; then echo "WS VERIFY: ALL PASS"; else echo "WS VERIFY: FAILURES PRESENT"; fi
exit "$FAILED"
