#!/bin/bash
set -euo pipefail

# Change to the repo root directory
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check everything both halves need up front, so a missing tool surfaces before
# the database is started rather than halfway through.
# shellcheck source=WS/scripts/lib/preflight.sh
source ./WS/scripts/lib/preflight.sh
require_no_sudo
require_docker
require_java
require_node

echo "🚀 Bootstrap script starting..."
echo "Setting up Full Stack Boilerplate..."

echo ""
echo "🔧 Setting up Server (WS)..."
echo "Running start_dev_docker.sh..."
./WS/scripts/start_dev_docker.sh

echo ""
echo "🎨 Setting up Frontend (FE)..."
echo "Running npm install..."
npm --prefix FE install

echo ""
echo "✅ Bootstrap complete! Both server and frontend are set up."
echo ""
echo "Server (WS): Docker containers are running with database and migrations"
echo "Frontend (FE): Dependencies are installed"
echo ""
echo "You can now start development:"
echo "- Server: open WS/ in IntelliJ IDEA and run the 'ApplicationKt' configuration"
echo "- Frontend: cd FE && npm run dev"
