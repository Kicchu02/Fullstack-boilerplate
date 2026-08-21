#!/bin/bash
set -euo pipefail

# Run from WS/ regardless of the caller's working directory, so that
# docker-compose.yml, ./gradlew and the paths inside build.gradle.kts all resolve.
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."

# shellcheck source=lib/preflight.sh
source ./scripts/lib/preflight.sh
# shellcheck source=lib/db.sh
source ./scripts/lib/db.sh
require_no_sudo
require_docker
require_java

# Fail fast and legibly if the volume was written by an older Postgres major.
if ! require_compatible_pgdata; then
  exit 1
fi

echo "🚀 Starting Docker Compose..."
docker compose up -d

echo "🛠️ Waiting for DB to be ready..."
if ! wait_for_db 60; then
  echo "Database did not become ready in time. Check 'docker compose logs db'." >&2
  exit 1
fi

echo "📜 Running Flyway migrations..."
./gradlew flywayMigrate

echo "📦 Generating Jooq code..."
./gradlew generateJooq

echo "✅ Done!"
