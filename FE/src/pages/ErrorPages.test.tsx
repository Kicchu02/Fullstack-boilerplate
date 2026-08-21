import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LOCATION_TEST_ID, renderWithProviders } from "../test/renderWithProviders";
import { ErrorPage } from "./ErrorPage";
import { PageNotFoundPage } from "./PageNotFoundPage";

describe("ErrorPage", () => {
  it("shows the 500 message", () => {
    renderWithProviders(<ErrorPage />);
    expect(screen.getByRole("heading", { name: "500" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Internal Server Error" })).toBeInTheDocument();
  });

  it("navigates home", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ErrorPage />, "/500");

    await user.click(screen.getByRole("button", { name: "Go to Home" }));

    await waitFor(() =>
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent("/home"),
    );
  });
});

describe("PageNotFoundPage", () => {
  it("shows the 404 message", () => {
    renderWithProviders(<PageNotFoundPage />);
    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Page Not Found" })).toBeInTheDocument();
  });

  it("navigates home", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PageNotFoundPage />, "/nope");

    await user.click(screen.getByRole("button", { name: "Go to Home" }));

    await waitFor(() =>
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent("/home"),
    );
  });
});
