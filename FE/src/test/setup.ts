// Registers @testing-library/jest-dom's matchers (toBeInTheDocument, toBeDisabled, ...)
// and their type declarations. Wired in via `test.setupFiles` in vite.config.ts.
import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library only auto-registers its cleanup when Vitest globals are enabled.
// This project keeps `globals: false` so that describe/it/expect are explicit imports,
// which means cleanup has to be wired up by hand — without it, each render is appended
// to the same document and queries start failing with "found multiple elements".
afterEach(cleanup);
