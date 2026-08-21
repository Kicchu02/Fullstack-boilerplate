import { render, type RenderResult } from "@testing-library/react";
import type React from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { RootStoreProvider } from "../stores/RootStore";

// Renders the current pathname so tests can assert navigation happened. Pages navigate
// through useNavigateHelper(), and asserting "we ended up at /signIn" is the only way to
// check that from outside — the alternative is mocking useNavigate, which would stop
// testing the thing we care about.
export const LOCATION_TEST_ID = "current-location";

const LocationProbe = (): React.ReactElement => (
  <div data-testid={LOCATION_TEST_ID}>{useLocation().pathname}</div>
);

// Pages reach state through the store hooks and navigate through useNavigateHelper(), so
// rendering one in isolation needs both a store root and a router in the tree.
// MemoryRouter keeps navigation in memory instead of touching window.history.
export const renderWithProviders = (
  ui: React.ReactNode,
  initialPath = "/",
): RenderResult =>
  render(
    <RootStoreProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        {ui}
        <LocationProbe />
      </MemoryRouter>
    </RootStoreProvider>,
  );
