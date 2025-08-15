package com.example.user

import com.example.DatabaseFactory
import com.example.dto.UserIdentity
import com.example.queries.abstractQueries.InvalidateWTByUserId
import com.example.user.apiInterfaces.SignOut
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

internal class SignOutServerImpl(private val userIdentity: UserIdentity) : SignOut(), KoinComponent {
    private val invalidateWTByUserId by inject<InvalidateWTByUserId>()

    override suspend fun execute(request: Request): Response {
        return DatabaseFactory.transaction { ctx ->
            invalidateWTByUserId.execute(
                ctx = ctx,
                input = InvalidateWTByUserId.Input(
                    userId = userIdentity.userId,
                ),
            )
            Response
        }
    }
}
