package com.example.dummy

import com.example.dto.UserIdentity
import com.example.dummy.apiInterfaces.DummyApi
import org.koin.core.component.KoinComponent

internal class DummyApiServerImpl(private val userIdentity: UserIdentity) : DummyApi(), KoinComponent {
    override suspend fun execute(request: Request): Response {
        return Response(message = "Dummy API. UserId: ${userIdentity.userId}. Privileges: ${userIdentity.privileges}")
    }
}
