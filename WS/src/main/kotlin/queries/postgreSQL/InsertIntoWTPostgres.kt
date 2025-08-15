package com.example.queries.postgreSQL

import com.example.DBException
import com.example.queries.abstractQueries.InsertIntoWT
import `ktor-sample`.jooq.tables.references.WEBTOKEN
import org.jooq.DSLContext

internal class InsertIntoWTPostgres : InsertIntoWT() {
    override fun execute(ctx: DSLContext, input: Input): Result {
        val status = ctx.insertInto(WEBTOKEN)
            .set(WEBTOKEN.TOKEN, input.wt)
            .set(WEBTOKEN.USERID, input.userId)
            .set(WEBTOKEN.EXPIRESAT, input.expiresAt)
            .execute()
        if (status != 1) {
            throw DBException("Failed to insert wt: ${input.wt} into WebToken.")
        }
        return Result
    }
}
