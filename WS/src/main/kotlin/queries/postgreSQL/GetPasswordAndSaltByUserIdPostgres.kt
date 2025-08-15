package com.example.queries.postgreSQL

import com.example.DBException
import com.example.getNonNullValue
import com.example.queries.abstractQueries.GetPasswordAndSaltByUserId
import `ktor-sample`.jooq.tables.references.USER
import org.jooq.DSLContext

internal class GetPasswordAndSaltByUserIdPostgres : GetPasswordAndSaltByUserId() {
    override fun execute(ctx: DSLContext, input: Input): Result {
        return ctx.select(USER.PASSWORD, USER.SALT)
            .from(USER)
            .where(
                USER.ID.eq(input.userId)
                    .and(USER.ISACTIVE.isTrue),
            )
            .fetchOne()
            ?.let {
                Result(
                    password = it.getNonNullValue(USER.PASSWORD),
                    salt = it.getNonNullValue(USER.SALT),
                )
            } ?: throw DBException("No rows returned.")
    }
}
