package com.example.queries.abstractQueries

import com.example.dto.EmailId
import com.example.interfaces.QueryInterface
import com.example.interfaces.QueryInterface.QueryInput
import com.example.interfaces.QueryInterface.QueryResult
import com.example.queries.abstractQueries.GetUserIdByEmail.Input
import com.example.queries.abstractQueries.GetUserIdByEmail.Result
import java.util.UUID

internal abstract class GetUserIdByEmail : QueryInterface<Input, Result> {
    data class Input(
        val emailId: EmailId,
    ) : QueryInput

    data class Result(
        val userId: UUID,
    ) : QueryResult
}
