import { ConfigProvider } from "antd";
// antd's global reset. Must be imported before app styles so main.css can override it.
import "antd/dist/reset.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./main.css";
import { router } from "./router";

// No store provider: Zustand stores are module singletons imported where they are used.
// ConfigProvider is antd's single theming/locale entry point — put design tokens here
// rather than reaching for per-component style overrides.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider>
      <RouterProvider router={router} />
    </ConfigProvider>
  </StrictMode>
);
