#!/bin/bash
set -euo pipefail

# Run from WS/ regardless of the caller's working directory, so that
# docker-compose.yml, ./gradlew and the paths inside build.gradle.kts all resolve.
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."

# shellcheck source=lib/preflight.sh
source ./scripts/lib/preflight.sh
require_no_sudo
require_docker
require_java

# flywayClean drops every table in the `public` schema, so the next
# start_dev_docker.sh re-runs all migrations from scratch. Run
# `docker compose down` from WS/ to stop the database and keep the data.
echo "🧹 Cleaning Flyway migrations (drops all data in the 'public' schema)..."
./gradlew flywayClean -Dflyway.cleanDisabled=false

echo "🛑 Stopping Docker Compose..."
docker compose down

echo "✅ Done!"
