import react from "@vitejs/plugin-react";
// defineConfig comes from vitest/config rather than vite so that the `test` block
// below is typed. Importing it from "vite" makes `tsc -b` reject `test` as an
// unknown option.
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  test: {
    // jsdom, not node: these tests render components and read the resulting DOM.
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
