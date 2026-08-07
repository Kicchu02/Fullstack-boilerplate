# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Kotlin 2.1 + Ktor 3.1 (Netty engine), JOOQ (typed SQL, codegen from DB schema) + Flyway (migrations), PostgreSQL, Koin (DI), kotlinx.serialization. Single Gradle module, package root `com.example`. Serves on port 8080; the FE dev server (`../FE`) expects it there.

## Commands

- `./scripts/start_dev_docker.sh` — `docker compose up -d` (Postgres on host port 54321) → `./gradlew flywayMigrate` → `./gradlew generateJooq`. Run this before building/running, and again after adding a migration, since JOOQ classes are generated from the live schema.
- `./scripts/stop_dev_docker.sh` — `flywayClean` then `docker compose down`.
- `./scripts/restart_db.sh` — stop then start; use after editing `src/main/resources/db/migration/*.sql`.
- `.bat` equivalents of the above exist for Windows.
- `./gradlew build` — compile/build.
- `./gradlew spotlessApply` — auto-format (ktlint via Spotless); run before committing Kotlin changes.
- The app is intended to be run from IntelliJ IDEA (see `.run/ApplicationKt.run.xml`, main class `com.example.ApplicationKt`, program arg `configuration/application.conf`) rather than via a gradlew run task.
- Config/credentials for local dev live in `configuration/application.conf` (HOCON) — DB connection, token expiry, password policy. No test suite is currently present.

## Architecture — layered, interface-first, one feature package per domain

Every backend feature follows the same shape; use it as the template for new endpoints:

1. **API contract** (`<feature>/apiInterfaces/<Name>.kt`): an `abstract class` implementing `APIInterface<Request, Response>` (`interfaces/APIInterface.kt`), defining `@Serializable data class Request`/`Response` and a `sealed class <Name>Exception` for domain errors. Pure contract, no logic.
2. **API implementation** (`<feature>/<Name>ServerImpl.kt`): implements the abstract class's `execute(request): response`, calling into one or more query interfaces.
3. **Query contract** (`queries/abstractQueries/<Name>.kt`): implements `QueryInterface<Input, Result>` (`interfaces/QueryInterface.kt`) — `fun execute(ctx: DSLContext, input): result`.
4. **Query implementation** (`queries/postgreSQL/<Name>Postgres.kt`): the JOOQ/SQL implementation of a query contract.
5. **Wiring** (`ServerModule.kt`): every API impl and query impl is registered in a Koin module (`routesModules`, `databaseModules`, `utilsModules`) — `single<Interface> { Impl() }` for stateless/singleton, `factory<Interface> { (param) -> Impl(param) }` when the impl needs a per-request value (e.g. `ApplicationCall`, `UserIdentity`).
6. **Routing** (`Routing.kt`): each `Route` extension function (e.g. `userRoutes()`) `receive`s the request DTO, calls `inject<ApiInterface>()` (or `call.executeAuthenticated<...>()` for authenticated endpoints — see `APIRoutingUtils.kt`), and maps the sealed exception's subtypes to HTTP status codes in a `try/catch`.

Auth: `WebToken` (UUID) validated via `ValidateWT`/`ValidateWTServerImpl`; authenticated routes go through `executeAuthenticated<T, Req, Res>` in `APIRoutingUtils.kt`, which validates the token and injects a `UserIdentity` into a Koin-`factory`-scoped API impl. Use this helper for any new authenticated endpoint rather than validating tokens manually.

DB access: `DatabaseFactory.kt` wraps HikariCP + JOOQ, exposing `transaction(isReadOnly, isolationLevel) { ctx: DSLContext -> ... }` — all query implementations receive a `DSLContext` this way rather than opening their own connections.

Schema: `src/main/resources/db/migration/V1__Create_tables.sql` is the current schema (RBAC-style: `User`, `UserRole`, `Privilege`, `UserRolePrivilegeMap`, `WebToken`). Add new migrations as `V<n>__description.sql`; JOOQ codegen (`generateJooq`) must be re-run after any schema change (the dev scripts do this automatically).

CORS is configured in `Application.kt` to allow `localhost:3000` (the FE dev server) with credentials — update this if the FE origin/port changes.
