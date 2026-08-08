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
