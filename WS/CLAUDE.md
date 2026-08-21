# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Kotlin 2.4 + Ktor 3.5 (Netty engine), JOOQ 3.21 (typed SQL, codegen from DB schema) + Flyway 13 (migrations), PostgreSQL 18, Koin 4 (DI), kotlinx.serialization. Single Gradle module, package root `com.example`. Serves on port 8080; the FE dev server (`../FE`) expects it there.

Every version lives in [`gradle/libs.versions.toml`](gradle/libs.versions.toml) — plugins included. The only exceptions are the two `classpath(...)` literals in `build.gradle.kts`'s `buildscript {}` block, because Gradle does not expose the catalog there; both carry comments naming the catalog keys they have to track. Add new dependencies to the catalog rather than inline.

Java is pinned to Temurin 25 in `../.mise.toml`, and `build.gradle.kts` declares `kotlin { jvmToolchain(25) }`. The two must move together: the mise pin decides which JDK Gradle *runs* on, the toolchain decides what bytecode it *emits*, and letting them drift means the build silently compiles for one target on another runtime. Java 25 emits class file major version 69 — a quick way to confirm the toolchain is actually in effect rather than cosmetic.

The Gradle wrapper (9.7.1) is what caps the Java version, and it supports Java 25. Builds are clean — `./gradlew help --warning-mode all` reports no deprecations. If a future Java bump needs a newer Gradle, bump the wrapper with the `wrapper` task (`./gradlew wrapper --gradle-version X --gradle-distribution-sha256-sum <sum>`) rather than hand-editing `gradle-wrapper.properties`, so the jar, both launcher scripts and the pinned checksum stay consistent.

## Commands

- `./scripts/start_dev_docker.sh` — `docker compose up -d` (Postgres on host port 54321) → `./gradlew flywayMigrate` → `./gradlew generateJooq`. Run this before building/running, and again after adding a migration, since JOOQ classes are generated from the live schema.
- `./scripts/stop_dev_docker.sh` — `flywayClean` then `docker compose down`. Destructive: run plain `docker compose down` from `WS/` to stop the DB without dropping data. `flywayClean` is skipped (with a notice) when the DB is already down, and `docker compose down` always runs even if the clean fails — so the script never leaves the container up after saying it stopped it.
- `./scripts/restart_db.sh` — stop then start; use after editing `src/main/resources/db/migration/*.sql`.
- All three scripts `cd` to `WS/` themselves, so they work from any directory. Linux/macOS only — there are no `.bat` equivalents.
- `scripts/lib/preflight.sh` is sourced by the start/stop scripts (and by `../bootstrap.sh`) and aborts with a fix message when `sudo` was used, Docker is unreachable, or `java`/`node` is missing. Never run these scripts with `sudo`: it discards the `PATH`/`JAVA_HOME` mise sets in the user's shell and Gradle fails with `JAVA_HOME is not set`. If Docker needs root, the fix is the `docker` group, not `sudo`.
- `scripts/lib/db.sh` holds `db_is_ready`/`wait_for_db`, used by both the start and stop scripts. The probe passes `-h 127.0.0.1` on purpose: unix-socket `pg_isready` also answers from the postgres entrypoint's init-time temporary server, which reports ready before the real TCP listener is up on a fresh volume. Keep the `-h` on any new probe, including the `docker-compose.yml` healthcheck.
- `./gradlew build` — compile/build.
- `./gradlew spotlessApply` — auto-format (ktlint via Spotless); run before committing Kotlin changes.
- `./gradlew run` — runs the server. `main()` in `Application.kt` requires the HOCON path as `argv[0]`, so the `run` task supplies `configuration/application.conf` in `build.gradle.kts`; there is nothing to pass by hand.
- `./gradlew installDist` then `./build/install/ktor-sample/bin/ktor-sample configuration/application.conf` — the packaged distribution. The path is relative to the working directory, so run it from `WS/`.
- IntelliJ remains the primary way to run it (see `.run/ApplicationKt.run.xml`, main class `com.example.ApplicationKt`, program arg `configuration/application.conf`).
- `application { mainClass }` is `com.example.ApplicationKt`, **not** `io.ktor.server.netty.EngineMain`. This app builds its server with `embeddedServer()` in its own `main()` and does not use Ktor's config-driven module loading — there is no `Application.module()` function, and no `application.yaml`. If you reintroduce `EngineMain`, you have to add that module function and move the HOCON loading into Ktor's config system; changing only `mainClass` back makes every entry point fail with `Module function cannot be found`.
- `./scripts/verify.sh` — the full backend gate: database up, `flywayMigrate`, `generateJooq`, `clean build`, `spotlessCheck --rerun-tasks`, `test`, a bytecode-target assertion derived from the `.mise.toml` Java pin, then the packaged app booted and all endpoints exercised with **body** assertions. Run this before claiming the backend works; `./gradlew build` alone does not start a server or touch the database. It refuses to run if port 8080 is already bound, because a leftover server would make the endpoint checks report the old build's behaviour as current.
- `./gradlew test` — JUnit 5. The suite is deliberately DB-free (`user/PasswordUtilsTest`, `dto/EmailIdTest`, `dto/SerializationTest`), so it runs without Docker. `PasswordUtils` is a `KoinComponent` that injects `Config`, so its test starts a Koin context with an inline HOCON policy in `@BeforeEach` and calls `stopKoin()` in `@AfterEach` — follow that pattern for any other `KoinComponent` under test, and remember Koin is global state, so a missing `stopKoin()` leaks into the next test class. Testing a query implementation would need a live database, since JOOQ sources are generated from the running schema.
- Config/credentials for local dev live in `configuration/application.conf` (HOCON) — DB connection, token expiry, password policy.

## Architecture — layered, interface-first, one feature package per domain

Every backend feature follows the same shape; use it as the template for new endpoints:

1. **API contract** (`<feature>/apiInterfaces/<Name>.kt`): an `abstract class` implementing `APIInterface<Request, Response>` (`interfaces/APIInterface.kt`), defining `@Serializable data class Request`/`Response` and a `sealed class <Name>Exception` for domain errors. Pure contract, no logic.
2. **API implementation** (`<feature>/<Name>ServerImpl.kt`): implements the abstract class's `execute(request): response`, calling into one or more query interfaces.
3. **Query contract** (`queries/abstractQueries/<Name>.kt`): implements `QueryInterface<Input, Result>` (`interfaces/QueryInterface.kt`) — `fun execute(ctx: DSLContext, input): result`.
4. **Query implementation** (`queries/postgreSQL/<Name>Postgres.kt`): the JOOQ/SQL implementation of a query contract.
DI note: only `koin-core` is on the classpath. Koin is started in `Application.kt`'s `main()` via `startKoin { modules(allModules) }`, and dependencies are resolved through `GlobalContext.get()` (see the `inject<T>()` helpers in `APIRoutingUtils.kt`) — **not** through Ktor's `install(Koin)` plugin. That is why `koin-ktor` and `koin-logger-slf4j` are deliberately absent; adding them back only makes sense as part of actually adopting the plugin, which means moving resolution off `GlobalContext` and threading the `ApplicationCall` through the call-scoped API.

5. **Wiring** (`ServerModule.kt`): every API impl and query impl is registered in a Koin module (`routesModules`, `databaseModules`, `utilsModules`) — `single<Interface> { Impl() }` for stateless/singleton, `factory<Interface> { (param) -> Impl(param) }` when the impl needs a per-request value (e.g. `ApplicationCall`, `UserIdentity`).
6. **Routing** (`Routing.kt`): each `Route` extension function (e.g. `userRoutes()`) `receive`s the request DTO, calls `inject<ApiInterface>()` (or `call.executeAuthenticated<...>()` for authenticated endpoints — see `APIRoutingUtils.kt`), and maps the sealed exception's subtypes to HTTP status codes in a `try/catch`.

Auth: `WebToken` (UUID) validated via `ValidateWT`/`ValidateWTServerImpl`; authenticated routes go through `executeAuthenticated<T, Req, Res>` in `APIRoutingUtils.kt`, which validates the token and injects a `UserIdentity` into a Koin-`factory`-scoped API impl. Use this helper for any new authenticated endpoint rather than validating tokens manually.

DB access: `DatabaseFactory.kt` wraps HikariCP + JOOQ, exposing `transaction(isReadOnly, isolationLevel) { ctx: DSLContext -> ... }` — all query implementations receive a `DSLContext` this way rather than opening their own connections.

Schema: `src/main/resources/db/migration/V1__Create_tables.sql` is the current schema (RBAC-style: `User`, `UserRole`, `Privilege`, `UserRolePrivilegeMap`, `WebToken`). Add new migrations as `V<n>__description.sql`; JOOQ codegen (`generateJooq`) must be re-run after any schema change (the dev scripts do this automatically).

CORS is configured in `Application.kt` to allow `localhost:3000` (the FE dev server) with credentials — update this if the FE origin/port changes.
