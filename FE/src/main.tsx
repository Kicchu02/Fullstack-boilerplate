import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./main.css";
import { router } from "./router";
import { RootStoreProvider } from "./stores/RootStore";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootStoreProvider>
      <RouterProvider router={router} />
    </RootStoreProvider>
  </StrictMode>
);
