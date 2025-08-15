package com.example

import com.typesafe.config.Config
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.jooq.DSLContext
import org.jooq.Record
import org.jooq.TableField
import org.jooq.impl.DSL
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import java.sql.Connection
import javax.sql.DataSource

object DatabaseFactory : KoinComponent {
    private val config by inject<Config>()
    private val dbHost = config.getString("database.host")
    private val dbPort = config.getString("database.port")
    private val dbName = config.getString("database.name")
    private val dbUser = config.getString("database.userName")
    private val dbPassword = config.getString("database.password")
    private val dbUrl = "jdbc:postgresql://$dbHost:$dbPort/$dbName"
    private lateinit var dataSource: DataSource

    fun init() {
        val config = HikariConfig().apply {
            jdbcUrl = dbUrl
            username = dbUser
            password = dbPassword
            driverClassName = "org.postgresql.Driver"
            maximumPoolSize = 10
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
        }
        dataSource = HikariDataSource(config)
    }

    fun <T> transaction(
        isReadOnly: Boolean = false,
        transactionIsolationLevel: Int = Connection.TRANSACTION_REPEATABLE_READ,
        block: (DSLContext) -> T,
    ): T {
        dataSource.connection.use { connection ->
            return try {
                connection.transactionIsolation = transactionIsolationLevel
                connection.autoCommit = false
                connection.isReadOnly = isReadOnly
                val ctx = DSL.using(connection, org.jooq.SQLDialect.POSTGRES)
                val result = block(ctx)
                if (!isReadOnly) {
                    connection.commit()
                }
                result
            } catch (exception: Exception) {
                if (!isReadOnly) {
                    connection.rollback()
                }
                throw exception
            }
        }
    }
}

fun <T : Any> Record.getNonNullValue(field: TableField<*, T?>): T {
    return this.get(field) ?: throw IllegalStateException("Field ${field.name} is unexpectedly null")
}

class DBException(message: String? = null) : RuntimeException(message)
