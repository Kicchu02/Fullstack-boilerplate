# Database helpers shared by the dev scripts. Source this, don't execute it.

# True when Postgres is accepting TCP connections inside the container.
#
# The `-h 127.0.0.1` is load-bearing. Without it pg_isready probes the unix
# socket, and the postgres entrypoint's init-time temporary server answers on
# that socket while it runs initdb with listen_addresses='' — so on a fresh
# volume the database looks ready before the real server is listening on TCP,
# which is the path Flyway and the app actually use. flywayMigrate then fails
# with "connection refused". Forcing TCP means we only see the real server.
#
# `docker compose exec` also fails when the container isn't running, so this
# doubles as an "is the database up at all?" check.
db_is_ready() {
  docker compose exec -T db pg_isready -h 127.0.0.1 -U admin -d demo >/dev/null 2>&1
}

# Poll db_is_ready until it succeeds, up to $1 attempts (default 60) one second
# apart. Returns non-zero if it never came up.
wait_for_db() {
  local attempts="${1:-60}" i
  for ((i = 0; i < attempts; i++)); do
    if db_is_ready; then
      return 0
    fi
    sleep 1
  done
  return 1
}

# A Postgres data directory can only be read by the major version that wrote it, and the
# postgres:18 image additionally moved PGDATA from /var/lib/postgresql/data to
# /var/lib/postgresql/18/docker. So a pgdata volume created by an older image is both
# unreadable and mounted at the wrong place: Postgres would quietly initialise a fresh
# cluster alongside the old files and hand back an empty database that looks fine.
#
# Detect that case up front and say so, instead of letting it look like success.
# Uses `docker compose run` so Compose resolves the volume itself — no guessing at the
# project-name prefix of the volume.
require_compatible_pgdata() {
  local legacy
  legacy=$(docker compose run --rm --no-deps --entrypoint sh db -c \
    'if [ -f /var/lib/postgresql/PG_VERSION ]; then cat /var/lib/postgresql/PG_VERSION; fi' \
    2>/dev/null | tr -d '\r[:space:]')

  if [ -n "$legacy" ]; then
    echo "" >&2
    echo "❌ The 'pgdata' volume holds a PostgreSQL ${legacy} data directory, but this project" >&2
    echo "   now runs PostgreSQL 18. Postgres cannot read a data directory written by an" >&2
    echo "   older major version, so the database cannot start from it." >&2
    echo "" >&2
    echo "   This is local development data only. Delete the volume and let the migrations" >&2
    echo "   rebuild the schema from scratch — run this from WS/:" >&2
    echo "" >&2
    echo "       docker compose down -v" >&2
    echo "       ./scripts/start_dev_docker.sh" >&2
    echo "" >&2
    echo "   If there is data in there you actually need, dump it with the OLD image first:" >&2
    echo "       docker run --rm -v ws_pgdata:/var/lib/postgresql/data -e POSTGRES_PASSWORD=x \\" >&2
    echo "         postgres:${legacy} pg_dumpall -U admin > backup.sql" >&2
    echo "" >&2
    return 1
  fi
  return 0
}
