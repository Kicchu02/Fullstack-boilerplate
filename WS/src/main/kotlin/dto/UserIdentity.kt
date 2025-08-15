package com.example.dto

import com.example.dto.SerializerUtils.UUIDSerializer
import kotlinx.serialization.Serializable
import java.util.UUID

@Serializable
data class UserIdentity(
    @Serializable(with = UUIDSerializer::class)
    val userId: UUID,
    val privileges: List<String>,
)
