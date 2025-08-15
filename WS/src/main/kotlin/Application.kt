package com.example

import com.typesafe.config.Config
import com.typesafe.config.ConfigFactory.parseFile
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.install
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.routing.CORS
import org.koin.core.context.startKoin
import org.koin.dsl.module
import java.io.File

private lateinit var config: Config

fun main(args: Array<String>) {
    config = parseFile(File(args.first()))

    startKoin {
        modules(allModules)
    }

    embeddedServer(factory = Netty, port = 8080) {
        install(plugin = ContentNegotiation) {
            json()
        }
        install(CORS) {
            allowHost("localhost:3000", schemes = listOf("http"))
            allowHeader(HttpHeaders.ContentType)
            allowHeader(HttpHeaders.Authorization)
            allowMethod(HttpMethod.Get)
            allowMethod(HttpMethod.Post)
            allowMethod(HttpMethod.Put)
            allowMethod(HttpMethod.Delete)
            allowMethod(HttpMethod.Options)
            allowCredentials = true
        }
        DatabaseFactory.init()
        configureRouting()
    }.start(wait = true)
}

private val appModules = module {
    single<Config> { config }
}

private val allModules = appModules + routesModules + databaseModules + utilsModules
