package com.example.user.apiInterfaces

import com.example.dto.EmailId
import com.example.dto.SerializerUtils.UUIDSerializer
import com.example.interfaces.APIInterface
import com.example.interfaces.APIInterface.APIRequest
import com.example.interfaces.APIInterface.APIResponse
import com.example.user.apiInterfaces.SignIn.Request
import com.example.user.apiInterfaces.SignIn.Response
import kotlinx.serialization.Serializable
import java.util.UUID

abstract class SignIn : APIInterface<Request, Response> {
    @Serializable
    data class Request(
        val emailId: EmailId,
        val password: String,
    ) : APIRequest {
        init {
            require(password.isNotBlank())
        }
    }

    @Serializable
    data class Response(
        @Serializable(with = UUIDSerializer::class)
        val webToken: UUID,
    ) : APIResponse

    sealed class SignInException(message: String? = null) : Exception(message) {
        class InvalidEmailId(message: String? = null) : SignInException(message = message)
        class InvalidPassword(message: String? = null) : SignInException(message = message)
    }
}
