import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LOCATION_TEST_ID, renderWithProviders } from "../test/renderWithProviders";
import { SignInPage } from "./SignInPage";

const { postAPI } = vi.hoisted(() => ({ postAPI: vi.fn() }));
vi.mock("../helpers", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../helpers")>()),
  postAPI,
}));

// These render through MUI, so they double as the regression net for MUI upgrades:
// TextField (with slotProps), Button (with the `loading` prop), IconButton and
// InputAdornment all have to keep producing accessible, queryable DOM.
describe("SignInPage", () => {
  beforeEach(() => {
    postAPI.mockReset();
    localStorage.clear();
  });

  it("renders the heading and both fields", () => {
    renderWithProviders(<SignInPage />);

    expect(screen.getByRole("heading", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("keeps the submit button disabled until both fields are filled", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignInPage />);

    const button = screen.getByRole("button", { name: "Sign In" });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText(/email/i), "a@b.com");
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText(/password/i), "Passw0rd!");
    expect(button).toBeEnabled();
  });

  it("writes what is typed back into the store-bound inputs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignInPage />);

    const email = screen.getByLabelText(/email/i);
    await user.type(email, "someone@example.com");

    // Controlled inputs bound straight to store fields: if the subscription breaks,
    // the value never appears.
    expect(email).toHaveValue("someone@example.com");
  });

  it("toggles password visibility from the adornment button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignInPage />);

    const password = screen.getByLabelText(/password/i);
    expect(password).toHaveAttribute("type", "password");

    // The only other button on the page is the disabled "Sign In" submit.
    const toggle = screen
      .getAllByRole("button")
      .find((b) => b.textContent === "");
    expect(toggle).toBeDefined();

    await user.click(toggle!);
    expect(password).toHaveAttribute("type", "text");

    await user.click(toggle!);
    expect(password).toHaveAttribute("type", "password");
  });

  it("offers a link to the sign up page", () => {
    renderWithProviders(<SignInPage />);
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("does not claim success when the request fails outright", async () => {
    postAPI.mockRejectedValue(new Error("Network Error"));
    const user = userEvent.setup();
    renderWithProviders(<SignInPage />);
    await user.type(screen.getByLabelText(/email/i), "a@b.com");
    await user.type(screen.getByLabelText(/password/i), "Passw0rd!");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    // Must not report success, and must not navigate away from the form.
    await waitFor(() =>
      expect(screen.queryByText("Sign in successful")).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId(LOCATION_TEST_ID)).not.toHaveTextContent("/home");
  });
});
