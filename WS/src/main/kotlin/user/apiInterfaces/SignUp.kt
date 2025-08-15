package com.example.user.apiInterfaces

import com.example.dto.EmailId
import com.example.dto.SerializerUtils.UUIDSerializer
import com.example.interfaces.APIInterface
import com.example.interfaces.APIInterface.APIRequest
import com.example.interfaces.APIInterface.APIResponse
import com.example.user.apiInterfaces.SignUp.Request
import com.example.user.apiInterfaces.SignUp.Response
import kotlinx.serialization.Serializable
import java.util.UUID

abstract class SignUp : APIInterface<Request, Response> {
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
        val userId: UUID,
    ) : APIResponse

    sealed class SignUpException(message: String? = null) : Exception(message) {
        class EmailAlreadyExistsException(message: String? = null) : SignUpException(message = message)
        class InsecurePasswordException(message: String? = null) : SignUpException(message = message)
    }
}
