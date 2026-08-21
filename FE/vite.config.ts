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
  build: {
    rolldownOptions: {
      output: {
        // Without this the whole app ships as one ~727 kB chunk, which trips Vite's 500 kB
        // warning and means any application change invalidates the entire download for a
        // returning visitor. Split, application code is ~58 kB and the vendor chunks stay
        // cached across deploys.
        //
        // The @rc-component group must come FIRST and must match on a bare substring.
        // antd imports its internals as real modules (`from '@rc-component/input'` etc), so
        // they are ~346 kB of the bundle on their own — but a stricter
        // /node_modules[\\/]@rc-component[\\/]/ pattern does NOT match the resolved module
        // ids and silently produces no chunk at all. If a group ever emits nothing, suspect
        // the path shape before suspecting the dependency.
        //
        // Result: antd ~232 kB, @rc-component ~346 kB, react ~91 kB, app ~58 kB — every
        // chunk under Vite's default threshold, so the limit is left at its stock value.
        advancedChunks: {
          groups: [
            { name: "antd-internals", test: /@rc-component/ },
            { name: "antd", test: /node_modules[\\/](antd|@ant-design)[\\/]/ },
            {
              name: "react",
              test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
            },
          ],
        },
      },
    },
  },
  test: {
    // jsdom, not node: these tests render components and read the resulting DOM.
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
