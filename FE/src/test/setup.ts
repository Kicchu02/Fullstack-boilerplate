// Registers @testing-library/jest-dom's matchers (toBeInTheDocument, toBeDisabled, ...)
// and their type declarations. Wired in via `test.setupFiles` in vite.config.ts.
import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// NOTE ON ORDER: Vitest runs afterEach hooks in REVERSE registration order — verified
// empirically, two probe hooks reported "B-registered-second then A-registered-first". So
// the store reset is registered FIRST here in order to run LAST, after cleanup has
// unmounted the tree. Registered the other way round, resetting a store would push new
// state into a still-mounted component outside act(). Do not reorder these two blocks.

// Zustand stores are module singletons, so state written by one test is still there for
// the next one and has to be cleared.
//
// The import is dynamic, and that is load-bearing rather than stylistic. Setup files are
// evaluated before test files, so a static `import { resetAllStores } from ...` here would
// pull in every store — and therefore the real ../helpers — before any test file's
// vi.mock("../helpers") is registered. The stores would then hold a reference to the real
// postAPI, every mock would be ignored, and the tests would issue real network requests
// that fail with a confusing 401. Importing inside the hook defers resolution until after
// the test file's mocks are in place.
afterEach(async () => {
  const { resetAllStores } = await import("../stores/resetAllStores");
  resetAllStores();
});

// Testing Library only auto-registers its cleanup when Vitest globals are enabled.
// This project keeps `globals: false` so that describe/it/expect are explicit imports,
// which means cleanup has to be wired up by hand — without it, each render is appended
// to the same document and queries start failing with "found multiple elements".
afterEach(cleanup);
