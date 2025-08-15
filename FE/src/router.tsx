import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { ErrorPage } from "./pages/ErrorPage";
import { HomePage } from "./pages/HomePage";
import { PageNotFoundPage } from "./pages/PageNotFoundPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { Routes } from "./RoutesHelper";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: Routes.SignUp, element: <SignUpPage /> },
      { path: Routes.SignIn, element: <SignInPage /> },
      { path: Routes.Home, element: <HomePage /> },
      { path: Routes.ServerError, element: <ErrorPage /> },
      { path: Routes.PageNotFound, element: <PageNotFoundPage /> },
      { path: "*", element: <PageNotFoundPage /> },
    ],
  },
]);
