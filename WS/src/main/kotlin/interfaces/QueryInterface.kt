package com.example.interfaces

import com.example.interfaces.QueryInterface.QueryInput
import com.example.interfaces.QueryInterface.QueryResult
import org.jooq.DSLContext

interface QueryInterface<I : QueryInput, R : QueryResult> {
    interface QueryInput

    interface QueryResult

    fun execute(ctx: DSLContext, input: I): R
}
