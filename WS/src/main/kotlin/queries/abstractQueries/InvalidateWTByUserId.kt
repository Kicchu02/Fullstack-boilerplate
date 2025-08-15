package com.example.queries.abstractQueries

import com.example.interfaces.QueryInterface
import com.example.interfaces.QueryInterface.QueryInput
import com.example.interfaces.QueryInterface.QueryResult
import com.example.queries.abstractQueries.InvalidateWTByUserId.Input
import com.example.queries.abstractQueries.InvalidateWTByUserId.Result
import java.util.UUID

internal abstract class InvalidateWTByUserId : QueryInterface<Input, Result> {
    data class Input(
        val userId: UUID,
    ) : QueryInput

    data object Result : QueryResult
}
