package com.example.user

import com.typesafe.config.Config
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64

class PasswordUtils : KoinComponent {
    private val config by inject<Config>()
    private val minimumLength = config.getInt("password.minimumLength")
    private val minimumNumberOfCapitalLetters = config.getInt("password.minimumNumberOfCapitalLetters")
    private val minimumNumberOfSpecialCharacters = config.getInt("password.minimumNumberOfSpecialCharacters")
    private val minimumNumberOfNumbers = config.getInt("password.minimumNumberOfNumbers")

    internal fun generateSalt(): String {
        val saltBytes = ByteArray(16)
        SecureRandom().nextBytes(saltBytes)
        return Base64.getEncoder().encodeToString(saltBytes)
    }

    internal fun hashPassword(password: String, salt: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val combined = (password + salt).toByteArray()
        val hashedBytes = digest.digest(combined)
        return Base64.getEncoder().encodeToString(hashedBytes)
    }

    internal fun isPasswordValid(
        plainPasswordToCheck: String,
        hashedPassword: String,
        salt: String,
    ): Boolean {
        val attemptedHash = hashPassword(password = plainPasswordToCheck, salt = salt)
        return attemptedHash == hashedPassword
    }

    internal fun isPasswordStrong(password: String): Boolean {
        return (
            password.length > minimumLength &&
                password.count { it.isUpperCase() } >= minimumNumberOfCapitalLetters &&
                password.count { !it.isLetterOrDigit() } >= minimumNumberOfSpecialCharacters &&
                password.count { it.isDigit() } >= minimumNumberOfNumbers
            )
    }
}
