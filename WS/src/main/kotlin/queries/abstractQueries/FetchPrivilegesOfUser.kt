package com.example.queries.abstractQueries

import com.example.interfaces.QueryInterface
import com.example.interfaces.QueryInterface.QueryInput
import com.example.interfaces.QueryInterface.QueryResult
import com.example.queries.abstractQueries.FetchPrivilegesOfUser.Input
import com.example.queries.abstractQueries.FetchPrivilegesOfUser.Result
import java.util.UUID

internal abstract class FetchPrivilegesOfUser : QueryInterface<Input, Result> {
    data class Input(
        val userId: UUID,
    ) : QueryInput

    data class Result(
        val privileges: List<String>,
    ) : QueryResult
}
