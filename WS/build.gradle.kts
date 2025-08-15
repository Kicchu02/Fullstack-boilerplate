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
    dependencies {
        classpath("com.typesafe:config:1.4.2")
    }
}

plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.ktor)
    id("org.flywaydb.flyway") version "9.22.0"
    id("nu.studer.jooq") version "8.2"
    id("com.diffplug.spotless") version "6.25.0"
    kotlin("plugin.serialization") version "2.1.0"
}

group = "com.example"
version = "0.0.1"

application {
    mainClass = "io.ktor.server.netty.EngineMain"

    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.netty)
    implementation(libs.logback.classic)
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.config.yaml)
    testImplementation(libs.ktor.server.test.host)
    testImplementation(libs.kotlin.test.junit)

    implementation("org.postgresql:postgresql:42.7.2")
    implementation("com.zaxxer:HikariCP:5.0.1")
    jooqGenerator("org.postgresql:postgresql:42.7.2")
    implementation("io.insert-koin:koin-core:3.5.0")
    implementation("io.insert-koin:koin-ktor:3.5.0")
    implementation("io.insert-koin:koin-logger-slf4j:3.5.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
    implementation("io.ktor:ktor-serialization-kotlinx-json:3.1.0")
    implementation("io.ktor:ktor-server-content-negotiation:3.1.0")
    implementation("io.ktor:ktor-server-cors")
}

flyway {
    url = dbUrl
    user = dbUser
    password = dbPassword
    schemas = arrayOf("public")
    locations = arrayOf("filesystem:src/main/resources/db/migration")
}

jooq {
    version.set("3.18.6")
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

spotless {
    kotlin {
        target("**/*.kt")
        targetExclude("build/**", "jooq/**")
        ktlint("0.50.0")
        trimTrailingWhitespace()
        indentWithSpaces()
        endWithNewline()
    }

    kotlinGradle {
        target("*.gradle.kts")
        ktlint()
        trimTrailingWhitespace()
        indentWithSpaces()
        endWithNewline()
    }
}
