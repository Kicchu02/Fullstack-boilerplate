package com.example.queries.postgreSQL

import com.example.queries.abstractQueries.InvalidateWTByUserId
import `ktor-sample`.jooq.tables.references.WEBTOKEN
import org.jooq.DSLContext

internal class InvalidateWTByUserIdPostgres : InvalidateWTByUserId() {
    override fun execute(
        ctx: DSLContext,
        input: Input,
    ): Result {
        ctx.update(WEBTOKEN)
            .set(WEBTOKEN.ISDELETED, true)
            .where(
                WEBTOKEN.USERID.eq(input.userId)
                    .and(WEBTOKEN.ISDELETED.isFalse),
            )
            .execute()
        return Result
    }
}
