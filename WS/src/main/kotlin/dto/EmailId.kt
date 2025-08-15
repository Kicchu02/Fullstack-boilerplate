package com.example.dto

import kotlinx.serialization.Serializable

@Serializable
data class EmailId(
    val emailId: String,
) {
    init {
        require(emailId.isNotBlank()) { "Email cannot be blank." }
        require(isValidEmail(emailId)) { "Invalid email format: $emailId" }
    }

    companion object {
        private val emailRegex = Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")

        fun isValidEmail(email: String): Boolean {
            return email.matches(emailRegex)
        }
    }
}
