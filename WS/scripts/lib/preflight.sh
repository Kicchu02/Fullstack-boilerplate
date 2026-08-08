# Environment checks shared by the dev scripts. Source this, don't execute it.
#
# The scripts need Java and Docker, and both are easy to lose without an obvious
# reason: mise puts Java on PATH by activating in *your shell*, so anything that
# starts a fresh environment (sudo above all) drops it, and Gradle then fails
# with a "JAVA_HOME is not set" error that says nothing about the real cause.
# Each check below fails early and prints the fix instead.
#
# These run in broken environments by definition, so they use only bash builtins
# — no cat, no grep — and never assume PATH is sane.

# Print each argument as a line on stderr.
_preflight_err() {
  printf '%s\n' "$@" >&2
}

require_no_sudo() {
  if [ -n "${SUDO_USER-}" ]; then
    _preflight_err \
      "❌ Do not run this script with sudo." \
      "" \
      "sudo starts a fresh root environment, discarding the PATH and JAVA_HOME that" \
      "mise sets in your shell. Gradle then fails with \"JAVA_HOME is not set\"." \
      "" \
      "If you reached for sudo because Docker needs root, add yourself to the docker" \
      "group instead — one time, then never sudo again:" \
      "" \
      "    sudo usermod -aG docker ${SUDO_USER}" \
      "    newgrp docker    # or log out and back in" \
      "" \
      "Then re-run this script as your normal user."
    exit 1
  fi
}

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    _preflight_err "❌ docker not found on PATH. Install Docker — see the root README."
    exit 1
  fi

  local err
  if err="$(docker info 2>&1 >/dev/null)"; then
    return 0
  fi

  # nocasematch rather than ${err,,}: macOS ships bash 3.2, which has no case
  # conversion. Restore the previous setting so we don't leak it to the caller.
  local nocase_was_set=0
  shopt -q nocasematch && nocase_was_set=1
  shopt -s nocasematch
  local denied=0
  [[ "$err" == *"permission denied"* ]] && denied=1
  [ "$nocase_was_set" -eq 1 ] || shopt -u nocasematch

  if [ "$denied" -eq 1 ]; then
    _preflight_err \
      "❌ Cannot talk to the Docker daemon: permission denied." \
      "" \
      "Add yourself to the docker group (one time), rather than running this script" \
      "with sudo — sudo would discard the JAVA_HOME that mise sets:" \
      "" \
      "    sudo usermod -aG docker \$USER" \
      "    newgrp docker    # or log out and back in"
  else
    _preflight_err \
      "❌ Cannot reach the Docker daemon. Is Docker running?" \
      "" \
      "    Linux: sudo systemctl start docker" \
      "    macOS: start Docker Desktop" \
      "" \
      "docker info said:" \
      "${err}"
  fi
  exit 1
}

# Shared body for the two mise-supplied tools: same failure, same fix.
_require_mise_tool() {
  local cmd="$1" needed_for="$2"
  if command -v "$cmd" >/dev/null 2>&1; then
    return 0
  fi
  _preflight_err \
    "❌ ${cmd} not found on PATH, so ${needed_for} cannot run." \
    "" \
    "mise supplies ${cmd} for this repo, but only in shells where mise is activated." \
    "Check that your shell's config activates mise (see \"Set up your toolchain\" in" \
    "the root README), open a new terminal, and run 'mise install' from the repo" \
    "root. 'mise ls' should list ${cmd}."
  exit 1
}

require_java() { _require_mise_tool java "./gradlew"; }

require_node() { _require_mise_tool node "npm install"; }
