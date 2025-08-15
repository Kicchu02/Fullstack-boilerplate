@echo off
echo 🧹 Cleaning Flyway migrations...
call gradlew flywayClean -Dflyway.cleanDisabled=false

echo 🛑 Stopping Docker Compose...
docker compose down

echo ✅ Done!
