package com.example.user

import com.example.DatabaseFactory
import com.example.dto.UserIdentity
import com.example.queries.abstractQueries.FetchPrivilegesOfUser
import com.example.queries.abstractQueries.FetchWTExpiresAtAndUserIdOrNull
import com.example.queries.abstractQueries.UpdateWTExpireTime
import com.example.user.apiInterfaces.ValidateWT
import com.example.user.apiInterfaces.ValidateWT.ValidateWTException.InvalidWTException
import com.typesafe.config.Config
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import java.time.Instant

internal class ValidateWTServerImpl : ValidateWT(), KoinComponent {
    private val config by inject<Config>()
    private val expirationDurationInSeconds = config.getLong("token.expirationDurationInSeconds")
    private val expirationRefreshThresholdInSeconds = config.getLong("token.expirationRefreshThresholdInSeconds")
    private val fetchPrivilegesOfUser by inject<FetchPrivilegesOfUser>()
    private val fetchWTExpiresAtAndUserIdOrNull by inject<FetchWTExpiresAtAndUserIdOrNull>()
    private val updateWTExpireTime by inject<UpdateWTExpireTime>()

    override suspend fun execute(request: Request): Response {
        return DatabaseFactory.transaction { ctx ->
            val currentTime = Instant.now()
            val (userId, expiresAt) = fetchWTExpiresAtAndUserIdOrNull.execute(
                ctx = ctx,
                input = FetchWTExpiresAtAndUserIdOrNull.Input(
                    wt = request.wt,
                    currentTime = currentTime,
                ),
            ).userIdAndExpiresAt ?: throw InvalidWTException()
            if (expiresAt < currentTime.plusSeconds(expirationRefreshThresholdInSeconds)) {
                updateWTExpireTime.execute(
                    ctx = ctx,
                    input = UpdateWTExpireTime.Input(
                        wt = request.wt,
                        expiresAt = currentTime.plusSeconds(expirationDurationInSeconds),
                        currentTime = currentTime,
                    ),
                )
            }
            val userPrivileges = fetchPrivilegesOfUser.execute(
                ctx = ctx,
                input = FetchPrivilegesOfUser.Input(
                    userId = userId,
                ),
            ).privileges
            Response(
                userIdentity = UserIdentity(
                    userId = userId,
                    privileges = userPrivileges,
                ),
            )
        }
    }
}
