import { Alert, Snackbar, Stack } from "@mui/material";
import type React from "react";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { WEB_TOKEN_COOKIE_NAME } from "./constants";
import { useNavigateHelper } from "./RoutesHelper";
import {
  selectIsAPIErrored,
  selectIsUnauthorized,
  useNetworkingStore,
} from "./stores/NetworkingStore";
import { showPopup, useUiStore } from "./stores/UiStore";

export const App = (): React.ReactElement => {
  const navigateHelper = useNavigateHelper();
  const isUnauthorized = useNetworkingStore(selectIsUnauthorized);
  const isAPIErrored = useNetworkingStore(selectIsAPIErrored);
  const resetNetworking = useNetworkingStore((s) => s.reset);
  const showFeatureInDevPopup = useUiStore((s) => s.showFeatureInDevPopup);
  const isPopupOpen = useUiStore((s) => s.isPopupOpen);
  const popupMessage = useUiStore((s) => s.popupMessage);
  const popupVariant = useUiStore((s) => s.popupVariant);

  useEffect(() => {
    if (isUnauthorized) {
      showPopup("Session expired. Please sign in again.", "error");
      navigateHelper.navigateToSignIn();
    }
  }, [isUnauthorized, navigateHelper]);

  useEffect(() => {
    if (isAPIErrored) {
      navigateHelper.navigateTo500();
    }
  }, [isAPIErrored, navigateHelper]);

  useEffect(() => {
    const token = localStorage.getItem(WEB_TOKEN_COOKIE_NAME);
    if (!token || token === "undefined" || token === "null") {
      navigateHelper.navigateToSignIn();
    } else if (token !== "undefined" && token !== "null") {
      navigateHelper.navigateToHome();
    }
    return resetNetworking;
  }, [navigateHelper, resetNetworking]);

  return (
    <Stack sx={{ height: "100%" }}>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showFeatureInDevPopup}
        message="This feature is still under development."
      />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={isPopupOpen}
        message={popupMessage}
      >
        <Alert severity={popupVariant} variant="filled">
          {popupMessage}
        </Alert>
      </Snackbar>
      <Outlet />
    </Stack>
  );
};
