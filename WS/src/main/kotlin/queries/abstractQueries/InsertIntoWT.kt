package com.example.queries.abstractQueries

import com.example.interfaces.QueryInterface
import com.example.interfaces.QueryInterface.QueryInput
import com.example.interfaces.QueryInterface.QueryResult
import com.example.queries.abstractQueries.InsertIntoWT.Input
import com.example.queries.abstractQueries.InsertIntoWT.Result
import java.time.Instant
import java.util.UUID

internal abstract class InsertIntoWT : QueryInterface<Input, Result> {
    data class Input(
        val wt: UUID,
        val userId: UUID,
        val expiresAt: Instant,
    ) : QueryInput

    data object Result : QueryResult
}
