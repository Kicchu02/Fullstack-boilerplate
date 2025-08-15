package com.example.user

import com.example.DatabaseFactory
import com.example.queries.abstractQueries.CheckIfUserExistsByEmail
import com.example.queries.abstractQueries.InsertIntoUser
import com.example.user.apiInterfaces.SignUp
import com.example.user.apiInterfaces.SignUp.SignUpException.EmailAlreadyExistsException
import org.jooq.DSLContext
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import java.util.UUID

internal class SignUpServerImpl : SignUp(), KoinComponent {
    private val insertIntoUser by inject<InsertIntoUser>()
    private val checkIfUserExistsByEmail by inject<CheckIfUserExistsByEmail>()
    private val passwordUtils by inject<PasswordUtils>()

    override suspend fun execute(request: Request): Response {
        return DatabaseFactory.transaction { ctx ->
            validateRequest(ctx = ctx, request = request)
            val userId = UUID.randomUUID()
            val salt = passwordUtils.generateSalt()
            val hashedPassword = passwordUtils.hashPassword(request.password, salt)
            insertIntoUser.execute(
                ctx = ctx,
                input = InsertIntoUser.Input(
                    id = userId,
                    email = request.emailId,
                    password = hashedPassword,
                    salt = salt,
                ),
            )
            Response(userId = userId)
        }
    }

    private fun validateRequest(ctx: DSLContext, request: Request) {
        val isEmailExisting = checkIfUserExistsByEmail.execute(
            ctx = ctx,
            input = CheckIfUserExistsByEmail.Input(emailId = request.emailId),
        ).exists
        if (isEmailExisting) {
            throw EmailAlreadyExistsException("Email id: ${request.emailId} already exists in the system.")
        }
        if (!passwordUtils.isPasswordStrong(password = request.password)) {
            throw SignUpException.InsecurePasswordException("Password is not secure")
        }
    }
}
