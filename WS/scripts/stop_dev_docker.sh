#!/bin/bash

echo "🧹 Cleaning Flyway migrations..."
../gradlew flywayClean -Dflyway.cleanDisabled=false

echo "🛑 Stopping Docker Compose..."
docker compose down

echo "✅ Done!"
