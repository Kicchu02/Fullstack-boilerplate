import { render, type RenderResult } from "@testing-library/react";
import type React from "react";
import { MemoryRouter } from "react-router-dom";
import { RootStoreProvider } from "../stores/RootStore";

// Pages reach state through useRootStore() and navigate through useNavigateHelper(),
// so rendering one in isolation needs both an MST root and a router in the tree.
// MemoryRouter keeps navigation in memory instead of touching window.history.
export const renderWithProviders = (
  ui: React.ReactNode,
  initialPath = "/",
): RenderResult =>
  render(
    <RootStoreProvider>
      <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
    </RootStoreProvider>,
  );
