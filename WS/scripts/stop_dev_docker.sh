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

# flywayClean drops every table in the `public` schema, so the next
# start_dev_docker.sh re-runs all migrations from scratch. Run
# `docker compose down` from WS/ to stop the database and keep the data.
#
# It needs a reachable database, and legitimately cannot run when the container
# is already stopped — restart_db.sh's first step, for instance. Skip it in that
# case rather than failing, or `set -e` would abort before the database is
# started again.
clean_status=0
if db_is_ready; then
  echo "🧹 Cleaning Flyway migrations (drops all data in the 'public' schema)..."
  # Capture the exit code instead of letting `set -e` abort here: the
  # `docker compose down` below has to run either way, so the script never
  # leaves the container up after announcing that it stopped it.
  ./gradlew flywayClean -Dflyway.cleanDisabled=false || clean_status=$?
else
  echo "ℹ️  Database is not running — nothing to clean, skipping Flyway clean."
  echo "   The pgdata volume keeps its contents. If you edited an existing"
  echo "   migration, drop the volume so the next start re-applies every"
  echo "   migration from scratch: docker compose down -v"
fi

echo "🛑 Stopping Docker Compose..."
docker compose down

if [ "$clean_status" -ne 0 ]; then
  echo "" >&2
  echo "⚠️  flywayClean failed (exit ${clean_status}), so the 'public' schema was NOT reset." >&2
  echo "   The container has been stopped. To force a full reset, remove the volume:" >&2
  echo "       docker compose down -v" >&2
  exit "$clean_status"
fi

echo "✅ Done!"
