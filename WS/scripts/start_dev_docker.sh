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

echo "🚀 Starting Docker Compose..."
docker compose up -d

echo "🛠️ Waiting for DB to be ready..."
for _ in $(seq 1 60); do
  if docker compose exec -T db pg_isready -U admin -d demo >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
if ! docker compose exec -T db pg_isready -U admin -d demo >/dev/null 2>&1; then
  echo "Database did not become ready in 60s. Check 'docker compose logs db'." >&2
  exit 1
fi

echo "📜 Running Flyway migrations..."
./gradlew flywayMigrate

echo "📦 Generating Jooq code..."
./gradlew generateJooq

echo "✅ Done!"
