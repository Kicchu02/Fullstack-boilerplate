package com.example.queries.abstractQueries

import com.example.interfaces.QueryInterface
import com.example.interfaces.QueryInterface.QueryInput
import com.example.interfaces.QueryInterface.QueryResult
import com.example.queries.abstractQueries.GetPasswordAndSaltByUserId.Input
import com.example.queries.abstractQueries.GetPasswordAndSaltByUserId.Result
import java.util.UUID

internal abstract class GetPasswordAndSaltByUserId : QueryInterface<Input, Result> {
    data class Input(
        val userId: UUID,
    ) : QueryInput

    data class Result(
        val password: String,
        val salt: String,
    ) : QueryResult
}
