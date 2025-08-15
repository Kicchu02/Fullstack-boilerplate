package com.example.queries.postgreSQL

import com.example.DBException
import com.example.queries.abstractQueries.InsertIntoUser
import `ktor-sample`.jooq.tables.references.USER
import org.jooq.DSLContext

internal class InsertIntoUserPostgres : InsertIntoUser() {
    override fun execute(ctx: DSLContext, input: Input): Result {
        val status = ctx.insertInto(USER)
            .set(USER.ID, input.id)
            .set(USER.EMAIL, input.email.emailId)
            .set(USER.PASSWORD, input.password)
            .set(USER.SALT, input.salt)
            .set(USER.ROLE, "ADMIN")
            .execute()
        if (status != 1) {
            throw DBException("Failed to insert user with id: ${input.id} into User table.")
        }
        return Result
    }
}
