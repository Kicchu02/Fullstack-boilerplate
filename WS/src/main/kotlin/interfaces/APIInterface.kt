package com.example.interfaces

import com.example.interfaces.APIInterface.APIRequest
import com.example.interfaces.APIInterface.APIResponse

interface APIInterface<Req : APIRequest, Res : APIResponse> {
    interface APIRequest

    interface APIResponse

    suspend fun execute(request: Req): Res
}
