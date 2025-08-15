#!/bin/bash

echo "♻️ Restarting Dev Database..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"$SCRIPT_DIR/stop_dev_docker.sh"
"$SCRIPT_DIR/start_dev_docker.sh"

echo "✅ Restart complete!"
