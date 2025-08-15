package com.example.queries.abstractQueries

import com.example.dto.EmailId
import com.example.interfaces.QueryInterface
import com.example.interfaces.QueryInterface.QueryInput
import com.example.interfaces.QueryInterface.QueryResult
import com.example.queries.abstractQueries.InsertIntoUser.Input
import com.example.queries.abstractQueries.InsertIntoUser.Result
import java.util.UUID

internal abstract class InsertIntoUser : QueryInterface<Input, Result> {
    data class Input(
        val id: UUID,
        val email: EmailId,
        val password: String,
        val salt: String,
    ) : QueryInput

    data object Result : QueryResult
}
