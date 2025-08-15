package com.example

import com.example.dummy.apiInterfaces.DummyApi
import com.example.user.apiInterfaces.SignIn
import com.example.user.apiInterfaces.SignIn.SignInException
import com.example.user.apiInterfaces.SignOut
import com.example.user.apiInterfaces.SignUp
import com.example.user.apiInterfaces.SignUp.SignUpException
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing

fun Application.configureRouting() {
    routing {
        route("/user") { userRoutes() }
        route("/dummy") { dummyRoutes() }
    }
}

private fun Route.userRoutes() {
    post("/signUp") {
        try {
            val signUp = inject<SignUp>()
            val request = call.receive<SignUp.Request>()
            val response = signUp.execute(request = request)
            call.respond(response)
        } catch (signUpException: SignUpException) {
            when (signUpException) {
                is SignUpException.EmailAlreadyExistsException -> {
                    call.response.status(value = HttpStatusCode.Conflict)
                    call.respondText(text = "Email already exists.")
                }
                is SignUpException.InsecurePasswordException -> {
                    call.response.status(value = HttpStatusCode.BadRequest)
                    call.respondText(text = "Password is insecure.")
                }
            }
        }
    }
    post("/signIn") {
        try {
            val signIn = inject<SignIn>(call)
            val request = call.receive<SignIn.Request>()
            val response = signIn.execute(request = request)
            call.respond(message = response)
        } catch (signInException: SignInException) {
            when (signInException) {
                is SignInException.InvalidEmailId -> {
                    call.response.status(value = HttpStatusCode.Unauthorized)
                    call.respondText(text = "Email doesn't exist.")
                }
                is SignInException.InvalidPassword -> {
                    call.response.status(value = HttpStatusCode.Unauthorized)
                    call.respondText(text = "Invalid password.")
                }
            }
        }
    }
    post("/signOut") {
        val response = call.executeAuthenticated<SignOut, SignOut.Request, SignOut.Response>(
            request = call.receive<SignOut.Request>(),
        )
        call.respond(message = response)
    }
}

private fun Route.dummyRoutes() {
    // Authenticated dummy API example
    post("/dummy") {
        val response = call.executeAuthenticated<DummyApi, DummyApi.Request, DummyApi.Response>(
            request = call.receive<DummyApi.Request>(),
        )
        call.respond(message = response)
    }
}
