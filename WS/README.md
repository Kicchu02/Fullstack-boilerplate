# Ktor Sample Project

A Kotlin-based web application built with Ktor framework, featuring user authentication, PostgreSQL database integration, and JOOQ for database operations.

This project is worked on standalone — open the `WS/` folder as the project root in your IDE, not the repository root. Everything you need to set it up and run it is in this README.

## Prerequisites

Install Docker, IntelliJ IDEA, and mise, then run `mise install` — see the [root README](../README.md) for all four. mise supplies the Java version this project uses, read from [`../.mise.toml`](../.mise.toml).

Gradle comes from the checked-in wrapper (`./gradlew`), so there is nothing to install for it.

Docker needs to be running before you start the database, and you need to be able to run `docker` without `sudo` — on Linux that takes a one-time step, see [Linux: run Docker without sudo](../README.md#linux-run-docker-without-sudo). Run the scripts below as your normal user; they refuse to run under `sudo`, which would discard the `JAVA_HOME` that mise sets.

## Project Setup

### 1. Database Setup

The project uses PostgreSQL in Docker, published on host port `54321` (see `configuration/application.conf`). The scripts below locate themselves, so you can run them from any directory.

**Start the database.** This also applies the Flyway migrations and generates the JOOQ sources:

```bash
./scripts/start_dev_docker.sh
```

**Stop the database and keep your data:**

```bash
docker compose down
```

**Stop the database and reset it.** This drops every table in the `public` schema, so the next start re-applies all migrations from scratch:

```bash
./scripts/stop_dev_docker.sh
```

**Reset the database in place.** Run this after adding or editing a migration, so the JOOQ sources are regenerated from the new schema:

```bash
./scripts/restart_db.sh
```

## Running the Application

### 1. Running the Application in IntelliJ IDEA

Start the database first, then:

1. Open the `WS/` folder as a project in IntelliJ IDEA.
2. Point IntelliJ at the Java that mise installed. Print its path:

   ```bash
   mise where java
   ```

   In IntelliJ, go to **Settings ▸ Build, Execution, Deployment ▸ Build Tools ▸ Gradle**, set **Gradle JVM** to that path (use *Add JDK...* to browse to it), and click OK.
3. Wait for the Gradle import to finish — the status bar shows the progress.
4. Select the **`ApplicationKt`** configuration in the run dropdown at the top right and run it.

The server serves on `http://localhost:8080`.

Stop the application from IntelliJ when you are done, then stop the database with one of the commands above.

### 2. Build the Project

```bash
./gradlew build
```

## Database Migrations

The project uses Flyway for database migrations. Migration scripts live in `src/main/resources/db/migration/` and are named `V<n>__description.sql`.

`./scripts/start_dev_docker.sh` applies them and then regenerates the JOOQ sources from the resulting schema. After adding or editing a migration, run `./scripts/restart_db.sh` to pick up the change.

## Development

### Code Formatting

Run this before committing Kotlin changes:

```bash
./gradlew spotlessApply
```
