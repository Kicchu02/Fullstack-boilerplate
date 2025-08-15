package com.example.queries.postgreSQL

import com.example.getNonNullValue
import com.example.queries.abstractQueries.FetchWTExpiresAtAndUserIdOrNull
import `ktor-sample`.jooq.tables.references.WEBTOKEN
import org.jooq.DSLContext

internal class FetchWTExpiresAtAndUserIdOrNullPostgres : FetchWTExpiresAtAndUserIdOrNull() {
    override fun execute(ctx: DSLContext, input: Input): Result {
        return ctx.select(WEBTOKEN.USERID, WEBTOKEN.EXPIRESAT)
            .from(WEBTOKEN)
            .where(
                WEBTOKEN.TOKEN.eq(input.wt)
                    .and(WEBTOKEN.ISDELETED.isFalse)
                    .and(WEBTOKEN.EXPIRESAT.ge(input.currentTime)),

            )
            .fetch()
            .firstOrNull()
            ?.let {
                Result(
                    userIdAndExpiresAt = UserIdAndExpiresAt(
                        userId = it.getNonNullValue(WEBTOKEN.USERID),
                        expiresAt = it.getNonNullValue(WEBTOKEN.EXPIRESAT),
                    ),
                )
            } ?: Result(userIdAndExpiresAt = null)
    }
}
