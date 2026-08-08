#!/bin/bash
set -euo pipefail

# Resets the database: stop_dev_docker.sh runs flywayClean, so every migration
# is re-applied from scratch and existing data is dropped.
echo "♻️ Restarting Dev Database..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"$SCRIPT_DIR/stop_dev_docker.sh"
"$SCRIPT_DIR/start_dev_docker.sh"

echo "✅ Restart complete!"
