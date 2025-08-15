package com.example.queries.postgreSQL

import com.example.DBException
import com.example.queries.abstractQueries.UpdateWTExpireTime
import `ktor-sample`.jooq.tables.references.WEBTOKEN
import org.jooq.DSLContext

internal class UpdateWTExpireTimePostgres : UpdateWTExpireTime() {
    override fun execute(ctx: DSLContext, input: Input): Result {
        val status = ctx.update(WEBTOKEN)
            .set(WEBTOKEN.EXPIRESAT, input.expiresAt)
            .set(WEBTOKEN.MODIFIEDAT, input.currentTime)
            .where(
                WEBTOKEN.TOKEN.eq(input.wt)
                    .and(WEBTOKEN.ISDELETED.isFalse),
            )
            .execute()
        if (status != 1) {
            throw DBException("Unable to update expire time for wt: ${input.wt}.")
        }
        return Result
    }
}
