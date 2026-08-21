#!/bin/bash
# Verifies the frontend: install, type-check, build, lint, tests, and that the production
# build actually serves — every emitted chunk fetched over `vite preview`.
#
# Deliberately does NOT use `set -e`. Every check runs and the failures are summarised at
# the end, because "which checks failed" is far more useful than "the first one did".
set -uo pipefail

# Run from FE/ regardless of the caller's working directory.
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."

LOG="node_modules/.verify.log"   # inside node_modules, which is gitignored
PREVIEW_LOG="node_modules/.verify-preview.log"
mkdir -p node_modules 2>/dev/null
: > "$LOG"

FAILED=0
declare -a RESULTS=()
pass() { RESULTS+=("PASS  $1"); echo "PASS  $1"; }
fail() { RESULTS+=("FAIL  $1"); echo "FAIL  $1"; FAILED=1; }
info() { echo "----- $1"; }

run() { local label="$1"; shift
  info "$label"
  if "$@" >>"$LOG" 2>&1; then pass "$label"; else fail "$label (see FE/$LOG)"; tail -30 "$LOG"; fi
}

command -v node >/dev/null 2>&1 || { echo "node not found — run 'mise install' from the repo root" >&2; exit 1; }
info "node $(node --version) / npm $(npm --version)"

# npm ci is the check that package.json and package-lock.json still agree. Falling back to
# npm install would paper over exactly the drift worth catching, so a failure is reported.
info "npm ci"
if npm ci >>"$LOG" 2>&1; then pass "npm ci (lockfile in sync)"; else fail "npm ci — package-lock.json is out of step with package.json"; tail -30 "$LOG"; fi

run "npm run build (tsc -b && vite build)" npm run build
run "npm run lint" npm run lint
run "npm test" npm test

if [ -f dist/index.html ]; then
  pass "dist/index.html emitted"
else
  fail "dist/index.html not emitted"
fi

# ---------- serve the production build ----------
# Vite silently falls back to the next free port if 3000 is taken, and the checks below
# would then interrogate whatever else is listening — a stray dev server serves an
# index.html with #root and no hashed assets, which looks exactly like a build regression.
if (ss -ltn 2>/dev/null || netstat -an 2>/dev/null) | grep -qE '[.:]3000[[:space:]]'; then
  fail "port 3000 is already in use — cannot trust the preview check"
else
  info "vite preview"
  setsid npm run preview >"$PREVIEW_LOG" 2>&1 &
  PREV_PID=$!
  sleep 1
  UP=0
  for _ in $(seq 1 40); do
    curl -s -o /dev/null --max-time 2 http://localhost:3000/ && { UP=1; break; }
    kill -0 "$PREV_PID" 2>/dev/null || break
    sleep 1
  done

  if [ "$UP" != 1 ]; then
    fail "vite preview did not come up on :3000"
    tail -20 "$PREVIEW_LOG"
  else
    HTML=$(curl -s --max-time 5 http://localhost:3000/)
    echo "$HTML" | grep -q 'id="root"' && pass "preview serves index.html with #root" \
      || fail "served HTML is missing #root"

    # Every chunk, not just the first: the build emits several (app, react, antd, antd
    # internals, runtime) and one missing chunk breaks the app at load time.
    ASSETS=$(echo "$HTML" | grep -o '/assets/[A-Za-z0-9._-]*\.js' | sort -u)
    if [ -n "$ASSETS" ]; then
      BAD=0; N=0
      for A in $ASSETS; do
        N=$((N + 1))
        C=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://localhost:3000$A")
        [ "$C" = 200 ] || { fail "preview chunk $A -> $C"; BAD=1; }
      done
      [ "$BAD" = 0 ] && pass "preview serves all $N js chunks with 200"
    else
      fail "no js asset referenced in the served HTML"
    fi
  fi
  # Kill the process group: npm spawns vite as a child, so killing only npm leaves the
  # server holding the port for the next run.
  kill -- -"$PREV_PID" 2>/dev/null || kill "$PREV_PID" 2>/dev/null
  wait "$PREV_PID" 2>/dev/null
fi

echo
echo "================ FE VERIFY SUMMARY ================"
printf '%s\n' "${RESULTS[@]}"
echo "==================================================="
if [ "$FAILED" = 0 ]; then echo "FE VERIFY: ALL PASS"; else echo "FE VERIFY: FAILURES PRESENT"; fi
exit "$FAILED"
