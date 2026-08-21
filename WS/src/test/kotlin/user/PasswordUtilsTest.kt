package com.example.user

import com.typesafe.config.Config
import com.typesafe.config.ConfigFactory
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.koin.core.context.startKoin
import org.koin.core.context.stopKoin
import org.koin.dsl.module
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue

/**
 * PasswordUtils is a KoinComponent that reads the password policy from the injected Config,
 * so each test starts a Koin context with the same policy values as
 * configuration/application.conf. No database and no server are involved.
 */
class PasswordUtilsTest {
    private lateinit var passwordUtils: PasswordUtils

    @BeforeEach
    fun setUp() {
        val config: Config =
            ConfigFactory.parseString(
                """
                password {
                    minimumLength = 8
                    minimumNumberOfCapitalLetters = 1
                    minimumNumberOfSpecialCharacters = 1
                    minimumNumberOfNumbers = 1
                }
                """.trimIndent(),
            )
        startKoin { modules(module { single<Config> { config } }) }
        passwordUtils = PasswordUtils()
    }

    @AfterEach
    fun tearDown() = stopKoin()

    @Test
    fun `hashing is deterministic for the same password and salt`() {
        val salt = "a-fixed-salt"
        assertEquals(
            passwordUtils.hashPassword(password = "Passw0rd!", salt = salt),
            passwordUtils.hashPassword(password = "Passw0rd!", salt = salt),
        )
    }

    @Test
    fun `the same password hashes differently under different salts`() {
        assertNotEquals(
            passwordUtils.hashPassword(password = "Passw0rd!", salt = "salt-one"),
            passwordUtils.hashPassword(password = "Passw0rd!", salt = "salt-two"),
        )
    }

    @Test
    fun `generateSalt returns a fresh value each call`() {
        val salts = (1..50).map { passwordUtils.generateSalt() }
        assertEquals(50, salts.toSet().size, "salts must not repeat")
        // 16 random bytes, Base64 encoded
        assertTrue(salts.all { it.length == 24 }, "unexpected salt encoding: ${salts.first()}")
    }

    @Test
    fun `isPasswordValid accepts the original password and rejects anything else`() {
        val salt = passwordUtils.generateSalt()
        val hash = passwordUtils.hashPassword(password = "Passw0rd!", salt = salt)

        assertTrue(passwordUtils.isPasswordValid("Passw0rd!", hash, salt))
        assertFalse(passwordUtils.isPasswordValid("passw0rd!", hash, salt), "must be case sensitive")
        assertFalse(passwordUtils.isPasswordValid("Passw0rd", hash, salt))
        assertFalse(
            passwordUtils.isPasswordValid("Passw0rd!", hash, passwordUtils.generateSalt()),
            "a different salt must not validate",
        )
    }

    @Test
    fun `isPasswordStrong enforces every part of the policy`() {
        assertTrue(passwordUtils.isPasswordStrong("Passw0rd!"), "9 chars, upper, digit, special")

        assertFalse(passwordUtils.isPasswordStrong("passw0rd!"), "no capital letter")
        assertFalse(passwordUtils.isPasswordStrong("Password!"), "no digit")
        assertFalse(passwordUtils.isPasswordStrong("Passw0rdd"), "no special character")
        assertFalse(passwordUtils.isPasswordStrong("Pw0rd!"), "6 chars, too short")
        assertFalse(passwordUtils.isPasswordStrong(""), "empty")
    }

    @Test
    fun `minimumLength is inclusive, so a password of exactly that length is accepted`() {
        // Boundary case. This previously asserted the opposite: isPasswordStrong tested
        // `length > minimumLength`, so an otherwise-valid 8 character password was refused
        // even though the policy key is called minimumLength and is set to 8.
        assertEquals(8, "Passw0r!".length)
        assertTrue(passwordUtils.isPasswordStrong("Passw0r!"), "8 chars == minimumLength, must pass")
        assertFalse(passwordUtils.isPasswordStrong("Pssw0r!"), "7 chars is below minimumLength")
        assertTrue(passwordUtils.isPasswordStrong("Passw0rd!"))
    }
}
