package com.example.dummy.apiInterfaces

import com.example.dummy.apiInterfaces.DummyApi.Request
import com.example.dummy.apiInterfaces.DummyApi.Response
import com.example.interfaces.APIInterface
import kotlinx.serialization.Serializable

abstract class DummyApi : APIInterface<Request, Response> {
    @Serializable
    data object Request : APIInterface.APIRequest

    @Serializable
    data class Response(
        val message: String,
    ) : APIInterface.APIResponse
}
