package com.example.queries.postgreSQL

import com.example.getNonNullValue
import com.example.queries.abstractQueries.FetchPrivilegesOfUser
import `ktor-sample`.jooq.tables.references.PRIVILEGE
import `ktor-sample`.jooq.tables.references.USER
import `ktor-sample`.jooq.tables.references.USERROLE
import `ktor-sample`.jooq.tables.references.USERROLEPRIVILEGEMAP
import org.jooq.DSLContext

internal class FetchPrivilegesOfUserPostgres : FetchPrivilegesOfUser() {
    override fun execute(ctx: DSLContext, input: Input): Result {
        return Result(
            privileges = ctx.select(PRIVILEGE.NAME)
                .from(USER)
                .innerJoin(USERROLE)
                .on(
                    USER.ROLE.eq(USERROLE.NAME)
                        .and(USERROLE.ISDELETED.isFalse),
                )
                .innerJoin(USERROLEPRIVILEGEMAP)
                .on(USERROLE.NAME.eq(USERROLEPRIVILEGEMAP.USERROLE))
                .innerJoin(PRIVILEGE)
                .on(
                    USERROLEPRIVILEGEMAP.PRIVILEGE.eq(PRIVILEGE.NAME)
                        .and(PRIVILEGE.ISDELETED.isFalse),
                )
                .where(
                    USER.ID.eq(input.userId)
                        .and(USER.ISACTIVE.isTrue),
                )
                .fetch()
                .map {
                    it.getNonNullValue(PRIVILEGE.NAME)
                },
        )
    }
}
