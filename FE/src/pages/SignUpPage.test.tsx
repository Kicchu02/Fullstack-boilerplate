import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LOCATION_TEST_ID, renderWithProviders } from "../test/renderWithProviders";
import { SignUpPage } from "./SignUpPage";

const { postAPI } = vi.hoisted(() => ({ postAPI: vi.fn() }));
vi.mock("../helpers", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../helpers")>()),
  postAPI,
}));

// Behavioural tests: they drive the page the way a user does and assert on what is
// rendered or where we navigated. Nothing here asserts on the state library or the
// component library, so these keep their meaning across a migration of either.
describe("SignUpPage", () => {
  beforeEach(() => {
    postAPI.mockReset();
    localStorage.clear();
  });

  const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.type(screen.getByLabelText(/password/i), "Passw0rd!");
  };

  it("renders the heading and both fields", () => {
    renderWithProviders(<SignUpPage />);
    expect(screen.getByRole("heading", { name: "Sign Up" })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("keeps the submit button disabled until both fields are filled", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignUpPage />);
    const button = screen.getByRole("button", { name: "Sign Up" });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    expect(button).toBeDisabled();
    await user.type(screen.getByLabelText(/password/i), "Passw0rd!");
    expect(button).toBeEnabled();
  });

  it("navigates to sign in after a successful sign up", async () => {
    postAPI.mockResolvedValue({ data: {} });
    const user = userEvent.setup();
    renderWithProviders(<SignUpPage />);
    await fillForm(user);

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() =>
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent("/signIn"),
    );
  });

  it("shows the duplicate-email message and stays put on 409", async () => {
    postAPI.mockRejectedValue({ response: { status: 409, data: "Email already exists." } });
    const user = userEvent.setup();
    renderWithProviders(<SignUpPage />);
    await fillForm(user);

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(await screen.findByText("This email is already in use")).toBeInTheDocument();
    // A failed sign up must not navigate away, or the error would never be seen.
    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent("/");
    expect(screen.getByTestId(LOCATION_TEST_ID)).not.toHaveTextContent("/signIn");
  });

  it("reports an insecure password and stays put on 400", async () => {
    postAPI.mockRejectedValue({ response: { status: 400, data: "Password is insecure." } });
    const user = userEvent.setup();
    renderWithProviders(<SignUpPage />);
    await fillForm(user);

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(await screen.findByText("Password is insecure")).toBeInTheDocument();
    expect(screen.getByTestId(LOCATION_TEST_ID)).not.toHaveTextContent("/signIn");
  });

  it("offers a link to the sign in page", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignUpPage />);

    await user.click(screen.getByText("Sign In"));

    await waitFor(() =>
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent("/signIn"),
    );
  });
});
