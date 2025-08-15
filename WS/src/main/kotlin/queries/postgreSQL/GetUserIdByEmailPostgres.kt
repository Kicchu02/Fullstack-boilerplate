package com.example.queries.postgreSQL

import com.example.DBException
import com.example.getNonNullValue
import com.example.queries.abstractQueries.GetUserIdByEmail
import `ktor-sample`.jooq.tables.references.USER
import org.jooq.DSLContext

internal class GetUserIdByEmailPostgres : GetUserIdByEmail() {
    override fun execute(ctx: DSLContext, input: Input): Result {
        return ctx.select(USER.ID)
            .from(USER)
            .where(
                USER.EMAIL.eq(input.emailId.emailId)
                    .and(USER.ISACTIVE.isTrue),
            )
            .fetchOne()
            ?.let {
                Result(
                    userId = it.getNonNullValue(USER.ID),
                )
            } ?: throw DBException("No rows returned.")
    }
}
