import com.typesafe.config.Config
import com.typesafe.config.ConfigFactory
import java.io.File

val config: Config = ConfigFactory.parseFile(File("configuration/application.conf"))
val dbConfig: Config = config.getConfig("database")

val dbHost: String = dbConfig.getString("host")
val dbPort: Int = dbConfig.getInt("port")
val dbName: String = dbConfig.getString("name")
val dbUser: String = dbConfig.getString("userName")
val dbPassword: String = dbConfig.getString("password")
val dbUrl = "jdbc:postgresql://$dbHost:$dbPort/$dbName"

buildscript {
    // Gradle does not expose the version catalog inside buildscript {}, so these two are
    // the only version literals left in this file. Keep them in step with
    // typesafe-config-version and flyway-version in gradle/libs.versions.toml.
    dependencies {
        classpath("com.typesafe:config:1.4.9")
        classpath("org.flywaydb:flyway-database-postgresql:13.3.0")
    }
}

plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.ktor)
    alias(libs.plugins.flyway)
    alias(libs.plugins.jooq)
    alias(libs.plugins.spotless)
    alias(libs.plugins.kotlin.serialization)
}

group = "com.example"
version = "0.0.1"

// Read out of the version catalog into locals, because the jooq{} and spotless{} blocks
// below take a plain String rather than a plugin alias. The catalog remains the single
// source of truth. (ktlint's chain-method-continuation rule is what splits these
// accessors across lines; it is the formatter's call, not a style choice made here.)
val jooqVersion =
    libs.versions.jooq.version
        .get()
val ktlintVersion =
    libs.versions.ktlint.version
        .get()

// Pins the compile target instead of inheriting whatever JDK is on PATH, so the
// bytecode a clone produces doesn't depend on the developer's shell. Keep this in
// step with the java pin in ../.mise.toml.
kotlin {
    jvmToolchain(25)
}

application {
    // com.example.ApplicationKt, not Ktor's EngineMain. Application.kt declares its own
    // main() that builds the server with embeddedServer() and takes the HOCON config path
    // as argv[0]; it deliberately does not go through Ktor's config-driven module loading.
    mainClass = "com.example.ApplicationKt"

    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

// main() requires the config path as an argument, so supply it here — otherwise
// `./gradlew run` fails on args.first(). Matches the program argument in
// .run/ApplicationKt.run.xml, and is resolved relative to WS/.
tasks.named<JavaExec>("run") {
    args("configuration/application.conf")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.netty)
    implementation(libs.logback.classic)
    testImplementation(libs.ktor.server.test.host)
    testImplementation(platform(libs.junit.bom))
    testImplementation(libs.kotlin.test.junit5)
    testImplementation(libs.junit.jupiter)
    // Gradle needs the launcher on the test runtime classpath to run the JUnit Platform.
    testRuntimeOnly(libs.junit.platform.launcher)

    implementation(libs.postgresql)
    implementation(libs.hikaricp)
    jooqGenerator(libs.postgresql)

    // Application.kt imports com.typesafe.config.Config directly, so declare it rather
    // than relying on it arriving transitively through Ktor's HOCON config support.
    implementation(libs.typesafe.config)

    // koin-core only. This app starts Koin in main() and resolves through GlobalContext
    // rather than Ktor's install(Koin) plugin, so koin-ktor and koin-logger-slf4j are not
    // used — see WS/CLAUDE.md before adding them back.
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.core)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.ktor.server.cors)
}

flyway {
    url = dbUrl
    user = dbUser
    password = dbPassword
    schemas = arrayOf("public")
    locations = arrayOf("filesystem:src/main/resources/db/migration")
}

jooq {
    version.set(jooqVersion)
    configurations {
        create("main") {
            generateSchemaSourceOnCompilation.set(false)
            jooqConfiguration.apply {
                jdbc.apply {
                    driver = "org.postgresql.Driver"
                    url = dbUrl
                    user = dbUser
                    password = dbPassword
                }
                generator.apply {
                    name = "org.jooq.codegen.KotlinGenerator"
                    database.apply {
                        name = "org.jooq.meta.postgres.PostgresDatabase"
                        inputSchema = "public"
                        forcedTypes =
                            listOf(
                                org.jooq.meta.jaxb.ForcedType().apply {
                                    name = "Instant"
                                    includeTypes = "TIMESTAMPTZ|TIMESTAMP WITH TIME ZONE"
                                },
                            )
                    }
                    generate.apply {
                        isPojos = true
                    }
                    target.apply {
                        packageName = "ktor-sample.jooq"
                        directory = "$projectDir/jooq/src"
                    }
                }
            }
        }
    }
}

tasks.test {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")
    }
}

spotless {
    kotlin {
        target("**/*.kt")
        targetExclude("build/**", "jooq/**")
        ktlint(ktlintVersion)
        trimTrailingWhitespace()
        leadingTabsToSpaces()
        endWithNewline()
    }

    kotlinGradle {
        target("*.gradle.kts")
        ktlint(ktlintVersion)
        trimTrailingWhitespace()
        leadingTabsToSpaces()
        endWithNewline()
    }
}
