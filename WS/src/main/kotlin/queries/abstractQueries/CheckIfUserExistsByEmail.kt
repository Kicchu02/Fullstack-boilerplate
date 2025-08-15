package com.example.queries.abstractQueries

import com.example.dto.EmailId
import com.example.interfaces.QueryInterface
import com.example.interfaces.QueryInterface.QueryInput
import com.example.interfaces.QueryInterface.QueryResult
import com.example.queries.abstractQueries.CheckIfUserExistsByEmail.Input
import com.example.queries.abstractQueries.CheckIfUserExistsByEmail.Result

internal abstract class CheckIfUserExistsByEmail : QueryInterface<Input, Result> {
    data class Input(
        val emailId: EmailId,
    ) : QueryInput

    data class Result(
        val exists: Boolean,
    ) : QueryResult
}
