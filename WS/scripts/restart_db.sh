#!/bin/bash
set -euo pipefail

# Resets the database: stop_dev_docker.sh runs flywayClean, so every migration
# is re-applied from scratch and existing data is dropped.
echo "♻️ Restarting Dev Database..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# stop_dev_docker.sh skips flywayClean when the database is already down, so
# running this on a stopped database still reaches the start step below. It only
# exits non-zero when the clean genuinely failed, and `set -e` stopping here is
# deliberate then: starting again would just hit a Flyway validation error.
"$SCRIPT_DIR/stop_dev_docker.sh"
"$SCRIPT_DIR/start_dev_docker.sh"

echo "✅ Restart complete!"
