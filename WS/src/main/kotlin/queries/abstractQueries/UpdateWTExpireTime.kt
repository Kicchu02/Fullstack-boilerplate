package com.example.queries.abstractQueries

import com.example.interfaces.QueryInterface
import com.example.interfaces.QueryInterface.QueryInput
import com.example.interfaces.QueryInterface.QueryResult
import com.example.queries.abstractQueries.UpdateWTExpireTime.Input
import com.example.queries.abstractQueries.UpdateWTExpireTime.Result
import java.time.Instant
import java.util.UUID

internal abstract class UpdateWTExpireTime : QueryInterface<Input, Result> {
    data class Input(
        val wt: UUID,
        val expiresAt: Instant,
        val currentTime: Instant,
    ) : QueryInput

    data object Result : QueryResult
}
