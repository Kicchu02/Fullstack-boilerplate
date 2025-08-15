#!/bin/bash

echo "🚀 Starting Docker Compose..."
docker compose up -d

echo "🛠️ Waiting for DB to be ready..."
sleep 5

echo "📜 Running Flyway migrations..."
../gradlew flywayMigrate

echo "📦 Generating Jooq code..."
../gradlew generateJooq

echo "✅ Done!"
