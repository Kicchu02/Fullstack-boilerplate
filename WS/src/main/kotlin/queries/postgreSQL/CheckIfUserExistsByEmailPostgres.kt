package com.example.queries.postgreSQL

import com.example.queries.abstractQueries.CheckIfUserExistsByEmail
import `ktor-sample`.jooq.tables.references.USER
import org.jooq.DSLContext

internal class CheckIfUserExistsByEmailPostgres : CheckIfUserExistsByEmail() {
    override fun execute(ctx: DSLContext, input: Input): Result {
        return Result(
            exists = ctx.fetchExists(
                ctx.selectFrom(USER)
                    .where(
                        USER.EMAIL.eq(input.emailId.emailId)
                            .and(USER.ISACTIVE.isTrue),
                    ),
            ),
        )
    }
}
