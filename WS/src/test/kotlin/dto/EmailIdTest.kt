package com.example.dto

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class EmailIdTest {
    @Test
    fun `accepts ordinary addresses`() {
        listOf(
            "user@example.com",
            "first.last@example.co.uk",
            "user+tag@example.com",
            "user_name@example-host.com",
            "u@e.io",
        ).forEach { assertEquals(it, EmailId(it).emailId, "should have accepted $it") }
    }

    @Test
    fun `rejects blank input with a dedicated message`() {
        val error = assertFailsWith<IllegalArgumentException> { EmailId("") }
        assertEquals("Email cannot be blank.", error.message)
        assertFailsWith<IllegalArgumentException> { EmailId("   ") }
    }

    @Test
    fun `rejects malformed addresses`() {
        listOf(
            "no-at-sign.com",
            "@example.com",
            "user@",
            "user@host",
            "user@host.c",
            "user name@example.com",
            "user@@example.com",
        ).forEach {
            assertFailsWith<IllegalArgumentException>("should have rejected $it") { EmailId(it) }
        }
    }

    @Test
    fun `the malformed-address message names the offending value`() {
        val error = assertFailsWith<IllegalArgumentException> { EmailId("not-an-email") }
        assertEquals("Invalid email format: not-an-email", error.message)
    }

    @Test
    fun `isValidEmail agrees with the constructor`() {
        assertTrue(EmailId.isValidEmail("user@example.com"))
        assertFalse(EmailId.isValidEmail("user@host"))
    }
}
