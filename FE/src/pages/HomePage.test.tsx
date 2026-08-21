import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WEB_TOKEN_COOKIE_NAME } from "../constants";
import { deferred } from "../test/deferred";
import { LOCATION_TEST_ID, renderWithProviders } from "../test/renderWithProviders";
import { HomePage } from "./HomePage";

const { postAPI } = vi.hoisted(() => ({ postAPI: vi.fn() }));
vi.mock("../helpers", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../helpers")>()),
  postAPI,
}));

describe("HomePage", () => {
  beforeEach(() => {
    postAPI.mockReset();
    localStorage.clear();
  });

  it("shows the message from the dummy endpoint once it arrives", async () => {
    postAPI.mockResolvedValue({ data: { message: "Dummy API. UserId: abc Privileges: []" } });
    renderWithProviders(<HomePage />);

    expect(
      await screen.findByText("Dummy API. UserId: abc Privileges: []"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
  });

  it("withholds the message and the sign out button while the request is in flight", async () => {
    const d = deferred<{ data: { message: string } }>();
    postAPI.mockReturnValue(d.promise);
    renderWithProviders(<HomePage />);

    // In flight: nothing to act on yet.
    expect(screen.queryByRole("button", { name: "Sign Out" })).not.toBeInTheDocument();
    expect(screen.queryByText("loaded message")).not.toBeInTheDocument();

    d.resolve({ data: { message: "loaded message" } });

    expect(await screen.findByText("loaded message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
  });

  it("signing out clears the stored token and returns to sign in", async () => {
    postAPI.mockResolvedValue({ data: { message: "hello" } });
    localStorage.setItem(WEB_TOKEN_COOKIE_NAME, "a-token");
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);

    await user.click(await screen.findByRole("button", { name: "Sign Out" }));

    await waitFor(() =>
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent("/signIn"),
    );
    expect(localStorage.getItem(WEB_TOKEN_COOKIE_NAME)).toBeNull();
  });

  it("still navigates to sign in when the sign out request fails", async () => {
    postAPI
      .mockResolvedValueOnce({ data: { message: "hello" } })
      .mockRejectedValueOnce({ response: { status: 500 } });
    localStorage.setItem(WEB_TOKEN_COOKIE_NAME, "a-token");
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);

    await user.click(await screen.findByRole("button", { name: "Sign Out" }));

    // The catch swallows the error, so the user must not be stranded on a page they
    // believe they have signed out of.
    await waitFor(() =>
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent("/signIn"),
    );
  });
});
