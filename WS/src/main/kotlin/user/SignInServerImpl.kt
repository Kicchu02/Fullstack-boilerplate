package com.example.user

import com.example.DatabaseFactory
import com.example.queries.abstractQueries.CheckIfUserExistsByEmail
import com.example.queries.abstractQueries.GetPasswordAndSaltByUserId
import com.example.queries.abstractQueries.GetUserIdByEmail
import com.example.queries.abstractQueries.InsertIntoWT
import com.example.user.apiInterfaces.SignIn
import com.example.user.apiInterfaces.SignIn.SignInException.InvalidEmailId
import com.example.user.apiInterfaces.SignIn.SignInException.InvalidPassword
import com.typesafe.config.Config
import io.ktor.http.Cookie
import io.ktor.server.application.ApplicationCall
import org.jooq.DSLContext
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import java.time.Instant
import java.util.UUID

internal class SignInServerImpl(private val call: ApplicationCall) : SignIn(), KoinComponent {
    private val config by inject<Config>()
    private val expirationDurationInSeconds = config.getLong("token.expirationDurationInSeconds")
    private val checkIfUserExistsByEmail by inject<CheckIfUserExistsByEmail>()
    private val insertIntoWT by inject<InsertIntoWT>()
    private val getUserIdByEmail by inject<GetUserIdByEmail>()
    private val getPasswordAndSaltByUserId by inject<GetPasswordAndSaltByUserId>()
    private val passwordUtils by inject<PasswordUtils>()

    override suspend fun execute(request: Request): Response {
        return DatabaseFactory.transaction { ctx ->
            val userId = validateRequestGetUserId(ctx = ctx, request = request)
            val wt = UUID.randomUUID()
            insertIntoWT.execute(
                ctx = ctx,
                input = InsertIntoWT.Input(
                    wt = wt,
                    userId = userId,
                    expiresAt = Instant.now().plusSeconds(expirationDurationInSeconds),
                ),
            )
            call.response.cookies.append(
                item = Cookie(
                    name = "WebToken",
                    value = wt.toString(),
                    path = "/",
                    httpOnly = true,
                    maxAge = expirationDurationInSeconds.toInt(),
                    secure = false,
                ),
            )
            Response(webToken = wt)
        }
    }

    private fun validateRequestGetUserId(ctx: DSLContext, request: Request): UUID {
        if (!checkIfUserExistsByEmail.execute(
                ctx = ctx,
                input = CheckIfUserExistsByEmail.Input(emailId = request.emailId),
            ).exists
        ) {
            throw InvalidEmailId()
        }
        val userId = getUserIdByEmail.execute(
            ctx = ctx,
            input = GetUserIdByEmail.Input(emailId = request.emailId),
        ).userId
        val (hashedPassword, salt) = getPasswordAndSaltByUserId.execute(
            ctx = ctx,
            input = GetPasswordAndSaltByUserId.Input(userId = userId),
        )
        if (!passwordUtils.isPasswordValid(
                plainPasswordToCheck = request.password,
                hashedPassword = hashedPassword,
                salt = salt,
            )
        ) {
            throw InvalidPassword()
        }
        return userId
    }
}
