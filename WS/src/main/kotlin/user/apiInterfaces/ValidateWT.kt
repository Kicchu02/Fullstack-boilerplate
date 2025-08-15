package com.example.user.apiInterfaces

import com.example.dto.SerializerUtils.UUIDSerializer
import com.example.dto.UserIdentity
import com.example.interfaces.APIInterface
import com.example.interfaces.APIInterface.APIRequest
import com.example.interfaces.APIInterface.APIResponse
import com.example.user.apiInterfaces.ValidateWT.Request
import com.example.user.apiInterfaces.ValidateWT.Response
import kotlinx.serialization.Serializable
import java.util.UUID

abstract class ValidateWT : APIInterface<Request, Response> {
    @Serializable
    data class Request(
        @Serializable(with = UUIDSerializer::class)
        val wt: UUID,
    ) : APIRequest

    @Serializable
    data class Response(
        val userIdentity: UserIdentity,
    ) : APIResponse

    sealed class ValidateWTException(message: String? = null) : Exception(message) {
        class InvalidWTException(message: String? = null) : ValidateWTException(message = message)
    }
}
