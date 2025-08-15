package com.example.user.apiInterfaces

import com.example.interfaces.APIInterface
import com.example.interfaces.APIInterface.APIRequest
import com.example.interfaces.APIInterface.APIResponse
import com.example.user.apiInterfaces.SignOut.Request
import com.example.user.apiInterfaces.SignOut.Response
import kotlinx.serialization.Serializable

abstract class SignOut : APIInterface<Request, Response> {
    @Serializable
    data object Request : APIRequest

    @Serializable
    data object Response : APIResponse
}
