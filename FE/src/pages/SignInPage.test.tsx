import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../test/renderWithProviders";
import { SignInPage } from "./SignInPage";

// These render through MUI, so they double as the regression net for MUI upgrades:
// TextField (with slotProps), Button (with the `loading` prop), IconButton and
// InputAdornment all have to keep producing accessible, queryable DOM.
describe("SignInPage", () => {
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

    // Controlled inputs bound straight to MST fields: if the observer wiring breaks,
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
});
