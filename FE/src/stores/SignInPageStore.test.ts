import { beforeEach, describe, expect, it, vi } from "vitest";
import { WEB_TOKEN_COOKIE_NAME } from "../constants";
import {
  selectIsAPIErrored,
  selectIsButtonDisabled,
  useSignInPageStore,
} from "./SignInPageStore";

// Mock only postAPI, keeping the rest of helpers real, so the store's error branches can
// be driven without a backend.
const { postAPI } = vi.hoisted(() => ({ postAPI: vi.fn() }));
vi.mock("../helpers", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../helpers")>()),
  postAPI,
}));

// The store is a module singleton, so these read and write it directly via getState()
// rather than creating an instance. setup.ts resets every store after each test.
const store = () => useSignInPageStore.getState();

describe("SignInPageStore", () => {
  beforeEach(() => {
    postAPI.mockReset();
    localStorage.clear();
  });

  describe("selectIsButtonDisabled", () => {
    it("is disabled until both fields have content", () => {
      expect(selectIsButtonDisabled(store())).toBe(true);

      store().setEmail("a@b.com");
      expect(selectIsButtonDisabled(store())).toBe(true);

      store().setPassword("Passw0rd!");
      expect(selectIsButtonDisabled(store())).toBe(false);
    });

    it("treats whitespace-only input as empty", () => {
      store().setEmail("   ");
      store().setPassword("\t ");
      expect(selectIsButtonDisabled(store())).toBe(true);
    });
  });

  it("reset() restores the initial state", () => {
    store().setEmail("a@b.com");
    store().setPassword("Passw0rd!");

    store().reset();

    expect(store().email).toBe("");
    expect(store().password).toBe("");
    expect(selectIsButtonDisabled(store())).toBe(true);
  });

  it("stores the web token on a successful sign in", async () => {
    postAPI.mockResolvedValue({ data: { webToken: "token-123" } });
    store().setEmail("a@b.com");
    store().setPassword("Passw0rd!");

    await store().signIn();

    expect(postAPI).toHaveBeenCalledWith("/user/signIn", {
      emailId: { emailId: "a@b.com" },
      password: "Passw0rd!",
    });
    expect(localStorage.getItem(WEB_TOKEN_COOKIE_NAME)).toBe("token-123");
    expect(store().isLoading).toBe(false);
    expect(selectIsAPIErrored(store())).toBe(false);
  });

  it("flags the email field when the backend says the email does not exist", async () => {
    postAPI.mockRejectedValue({
      response: { status: 401, data: "Email doesn't exist." },
    });
    store().setEmail("nobody@b.com");
    store().setPassword("Passw0rd!");

    await store().signIn();

    expect(store().isEmailInvalid).toBe(true);
    expect(store().isPasswordInvalid).toBe(false);
    expect(selectIsAPIErrored(store())).toBe(true);
    expect(store().isLoading).toBe(false);
    expect(localStorage.getItem(WEB_TOKEN_COOKIE_NAME)).toBeNull();
  });

  it("flags the password field when the backend says the password is invalid", async () => {
    postAPI.mockRejectedValue({
      response: { status: 401, data: "Invalid password." },
    });
    store().setEmail("a@b.com");
    store().setPassword("wrong");

    await store().signIn();

    expect(store().isPasswordInvalid).toBe(true);
    expect(store().isEmailInvalid).toBe(false);
    expect(selectIsAPIErrored(store())).toBe(true);
  });

  it("clears a previous error before retrying", async () => {
    postAPI.mockRejectedValueOnce({
      response: { status: 401, data: "Invalid password." },
    });
    store().setEmail("a@b.com");
    store().setPassword("wrong");
    await store().signIn();
    expect(store().isPasswordInvalid).toBe(true);

    postAPI.mockResolvedValueOnce({ data: { webToken: "token-456" } });
    store().setPassword("Passw0rd!");
    await store().signIn();

    expect(store().isPasswordInvalid).toBe(false);
    expect(selectIsAPIErrored(store())).toBe(false);
  });

  it("sets isLoading while the request is in flight", async () => {
    let release!: (v: unknown) => void;
    postAPI.mockReturnValue(new Promise((r) => (release = r)));
    store().setEmail("a@b.com");
    store().setPassword("Passw0rd!");

    const pending = store().signIn();
    expect(store().isLoading).toBe(true);

    release({ data: { webToken: "t" } });
    await pending;
    expect(store().isLoading).toBe(false);
  });
});
