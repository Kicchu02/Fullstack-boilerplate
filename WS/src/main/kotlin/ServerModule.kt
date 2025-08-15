package com.example

import com.example.dto.UserIdentity
import com.example.dummy.DummyApiServerImpl
import com.example.dummy.apiInterfaces.DummyApi
import com.example.queries.abstractQueries.CheckIfUserExistsByEmail
import com.example.queries.abstractQueries.FetchPrivilegesOfUser
import com.example.queries.abstractQueries.FetchWTExpiresAtAndUserIdOrNull
import com.example.queries.abstractQueries.GetPasswordAndSaltByUserId
import com.example.queries.abstractQueries.GetUserIdByEmail
import com.example.queries.abstractQueries.InsertIntoUser
import com.example.queries.abstractQueries.InsertIntoWT
import com.example.queries.abstractQueries.InvalidateWTByUserId
import com.example.queries.abstractQueries.UpdateWTExpireTime
import com.example.queries.postgreSQL.CheckIfUserExistsByEmailPostgres
import com.example.queries.postgreSQL.FetchPrivilegesOfUserPostgres
import com.example.queries.postgreSQL.FetchWTExpiresAtAndUserIdOrNullPostgres
import com.example.queries.postgreSQL.GetPasswordAndSaltByUserIdPostgres
import com.example.queries.postgreSQL.GetUserIdByEmailPostgres
import com.example.queries.postgreSQL.InsertIntoUserPostgres
import com.example.queries.postgreSQL.InsertIntoWTPostgres
import com.example.queries.postgreSQL.InvalidateWTByUserIdPostgres
import com.example.queries.postgreSQL.UpdateWTExpireTimePostgres
import com.example.user.PasswordUtils
import com.example.user.SignInServerImpl
import com.example.user.SignOutServerImpl
import com.example.user.SignUpServerImpl
import com.example.user.ValidateWTServerImpl
import com.example.user.apiInterfaces.SignIn
import com.example.user.apiInterfaces.SignOut
import com.example.user.apiInterfaces.SignUp
import com.example.user.apiInterfaces.ValidateWT
import io.ktor.server.application.ApplicationCall
import org.koin.dsl.module

val routesModules = module {
    single<SignUp> { SignUpServerImpl() }
    single<ValidateWT> { ValidateWTServerImpl() }
    factory<SignIn> { (call: ApplicationCall) -> SignInServerImpl(call = call) }
    factory<SignOut> { (userIdentity: UserIdentity) -> SignOutServerImpl(userIdentity = userIdentity) }
    factory<DummyApi> { (userIdentity: UserIdentity) -> DummyApiServerImpl(userIdentity = userIdentity) }
}

val databaseModules = module {
    single<InsertIntoUser> { InsertIntoUserPostgres() }
    single<CheckIfUserExistsByEmail> { CheckIfUserExistsByEmailPostgres() }
    single<FetchPrivilegesOfUser> { FetchPrivilegesOfUserPostgres() }
    single<FetchWTExpiresAtAndUserIdOrNull> { FetchWTExpiresAtAndUserIdOrNullPostgres() }
    single<UpdateWTExpireTime> { UpdateWTExpireTimePostgres() }
    single<InsertIntoWT> { InsertIntoWTPostgres() }
    single<GetPasswordAndSaltByUserId> { GetPasswordAndSaltByUserIdPostgres() }
    single<GetUserIdByEmail> { GetUserIdByEmailPostgres() }
    single<InvalidateWTByUserId> { InvalidateWTByUserIdPostgres() }
}

val utilsModules = module {
    single<PasswordUtils> { PasswordUtils() }
}
