package com.example.queries.abstractQueries

import com.example.interfaces.QueryInterface
import com.example.interfaces.QueryInterface.QueryInput
import com.example.interfaces.QueryInterface.QueryResult
import com.example.queries.abstractQueries.FetchWTExpiresAtAndUserIdOrNull.Input
import com.example.queries.abstractQueries.FetchWTExpiresAtAndUserIdOrNull.Result
import java.time.Instant
import java.util.UUID

internal abstract class FetchWTExpiresAtAndUserIdOrNull : QueryInterface<Input, Result> {
    data class Input(
        val wt: UUID,
        val currentTime: Instant,
    ) : QueryInput

    data class Result(
        val userIdAndExpiresAt: UserIdAndExpiresAt?,
    ) : QueryResult

    internal data class UserIdAndExpiresAt(
        val userId: UUID,
        val expiresAt: Instant,
    )
}
