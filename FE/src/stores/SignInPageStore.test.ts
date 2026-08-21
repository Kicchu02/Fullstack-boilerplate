import { beforeEach, describe, expect, it, vi } from "vitest";
import { WEB_TOKEN_COOKIE_NAME } from "../constants";
import { createSignInPageStore } from "./SignInPageStore";

// Mock only postAPI, keeping the rest of helpers real, so the store's error branches can
// be driven without a backend while showPopup and friends stay untouched.
const { postAPI } = vi.hoisted(() => ({ postAPI: vi.fn() }));
vi.mock("../helpers", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../helpers")>()),
  postAPI,
}));

describe("SignInPageStore", () => {
  beforeEach(() => {
    postAPI.mockReset();
    localStorage.clear();
  });

  describe("isButtonDisabled", () => {
    it("is disabled until both fields have content", () => {
      const store = createSignInPageStore();
      expect(store.isButtonDisabled).toBe(true);

      store.setEmail("a@b.com");
      expect(store.isButtonDisabled).toBe(true);

      store.setPassword("Passw0rd!");
      expect(store.isButtonDisabled).toBe(false);
    });

    it("treats whitespace-only input as empty", () => {
      const store = createSignInPageStore();
      store.setEmail("   ");
      store.setPassword("\t ");
      expect(store.isButtonDisabled).toBe(true);
    });
  });

  it("reset() restores the snapshot captured in afterCreate", () => {
    const store = createSignInPageStore();
    store.setEmail("a@b.com");
    store.setPassword("Passw0rd!");

    store.reset();

    expect(store.email).toBe("");
    expect(store.password).toBe("");
    expect(store.isButtonDisabled).toBe(true);
  });

  it("stores the web token on a successful sign in", async () => {
    postAPI.mockResolvedValue({ data: { webToken: "token-123" } });
    const store = createSignInPageStore();
    store.setEmail("a@b.com");
    store.setPassword("Passw0rd!");

    await store.signIn();

    expect(postAPI).toHaveBeenCalledWith("/user/signIn", {
      emailId: { emailId: "a@b.com" },
      password: "Passw0rd!",
    });
    expect(localStorage.getItem(WEB_TOKEN_COOKIE_NAME)).toBe("token-123");
    expect(store.isLoading).toBe(false);
    expect(store.isAPIErrored).toBe(false);
  });

  it("flags the email field when the backend says the email does not exist", async () => {
    postAPI.mockRejectedValue({
      response: { status: 401, data: "Email doesn't exist." },
    });
    const store = createSignInPageStore();
    store.setEmail("nobody@b.com");
    store.setPassword("Passw0rd!");

    await store.signIn();

    expect(store.isEmailInvalid).toBe(true);
    expect(store.isPasswordInvalid).toBe(false);
    expect(store.isAPIErrored).toBe(true);
    expect(store.isLoading).toBe(false);
    expect(localStorage.getItem(WEB_TOKEN_COOKIE_NAME)).toBeNull();
  });

  it("flags the password field when the backend says the password is invalid", async () => {
    postAPI.mockRejectedValue({
      response: { status: 401, data: "Invalid password." },
    });
    const store = createSignInPageStore();
    store.setEmail("a@b.com");
    store.setPassword("wrong");

    await store.signIn();

    expect(store.isPasswordInvalid).toBe(true);
    expect(store.isEmailInvalid).toBe(false);
    expect(store.isAPIErrored).toBe(true);
  });

  it("clears a previous error before retrying", async () => {
    postAPI.mockRejectedValueOnce({
      response: { status: 401, data: "Invalid password." },
    });
    const store = createSignInPageStore();
    store.setEmail("a@b.com");
    store.setPassword("wrong");
    await store.signIn();
    expect(store.isPasswordInvalid).toBe(true);

    postAPI.mockResolvedValueOnce({ data: { webToken: "token-456" } });
    store.setPassword("Passw0rd!");
    await store.signIn();

    expect(store.isPasswordInvalid).toBe(false);
    expect(store.isAPIErrored).toBe(false);
  });
});
