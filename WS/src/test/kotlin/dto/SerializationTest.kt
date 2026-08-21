package com.example.dto

import com.example.dummy.apiInterfaces.DummyApi
import com.example.user.apiInterfaces.SignIn
import com.example.user.apiInterfaces.SignOut
import com.example.user.apiInterfaces.SignUp
import kotlinx.serialization.json.Json
import org.junit.jupiter.api.Test
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

/**
 * Locks down the JSON on the wire. The FE is written against these exact shapes, so a
 * serialization change here is a breaking API change even when everything still compiles.
 */
class SerializationTest {
    private val json = Json

    @Test
    fun `a UUID round-trips through the custom serializer as a plain string`() {
        val id = UUID.fromString("3f2504e0-4f89-11d3-9a0c-0305e82c3301")
        val encoded = json.encodeToString(SignUp.Response.serializer(), SignUp.Response(userId = id))

        assertEquals("""{"userId":"3f2504e0-4f89-11d3-9a0c-0305e82c3301"}""", encoded)
        assertEquals(id, json.decodeFromString(SignUp.Response.serializer(), encoded).userId)
    }

    @Test
    fun `signIn response serializes the web token as a string`() {
        val token = UUID.randomUUID()
        val encoded = json.encodeToString(SignIn.Response.serializer(), SignIn.Response(webToken = token))
        assertEquals("""{"webToken":"$token"}""", encoded)
    }

    @Test
    fun `signUp request deserializes the nested emailId object the FE sends`() {
        val request =
            json.decodeFromString(
                SignUp.Request.serializer(),
                """{"emailId":{"emailId":"user@example.com"},"password":"Passw0rd!"}""",
            )
        assertEquals("user@example.com", request.emailId.emailId)
        assertEquals("Passw0rd!", request.password)
    }

    @Test
    fun `request validation runs during deserialization`() {
        // The init blocks on these DTOs are the first line of defence, and they have to
        // fire on the deserialization path — not just when constructed in Kotlin.
        assertFailsWith<IllegalArgumentException> {
            json.decodeFromString(
                SignIn.Request.serializer(),
                """{"emailId":{"emailId":"user@example.com"},"password":""}""",
            )
        }
        assertFailsWith<IllegalArgumentException> {
            json.decodeFromString(
                SignUp.Request.serializer(),
                """{"emailId":{"emailId":"not-an-email"},"password":"Passw0rd!"}""",
            )
        }
    }

    @Test
    fun `the parameterless requests are empty JSON objects`() {
        // SignOut.Request and DummyApi.Request are data objects; the FE posts {} to both.
        assertEquals("{}", json.encodeToString(SignOut.Request.serializer(), SignOut.Request))
        assertEquals("{}", json.encodeToString(DummyApi.Request.serializer(), DummyApi.Request))
        json.decodeFromString(SignOut.Request.serializer(), "{}")
        json.decodeFromString(DummyApi.Request.serializer(), "{}")
    }

    @Test
    fun `user identity carries the userId and privileges the dummy endpoint reports`() {
        val identity = UserIdentity(userId = UUID.randomUUID(), privileges = listOf("READ", "WRITE"))
        val encoded = json.encodeToString(UserIdentity.serializer(), identity)
        assertEquals("""{"userId":"${identity.userId}","privileges":["READ","WRITE"]}""", encoded)
        assertEquals(identity, json.decodeFromString(UserIdentity.serializer(), encoded))
    }
}
