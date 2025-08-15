@echo off
echo 🚀 Starting Docker Compose...
docker compose up -d

echo 🛠️ Waiting for DB to be ready...
timeout /t 5 >nul

echo 📜 Running Flyway migrations...
call gradlew flywayMigrate

echo 📦 Generating Jooq code...
call gradlew generateJooq

echo ✅ Done!
