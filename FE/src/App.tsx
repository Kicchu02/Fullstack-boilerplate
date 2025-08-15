import { Alert, Snackbar, Stack } from "@mui/material";
import { observer } from "mobx-react-lite";
import type React from "react";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { WEB_TOKEN_COOKIE_NAME } from "./constants";
import { showPopup } from "./helpers";
import { useNavigateHelper } from "./RoutesHelper";
import { useNetworkingStore, useRootStore } from "./stores/hooks";

export const App = observer((): React.ReactElement => {
  const navigateHelper = useNavigateHelper();
  const rootStore = useRootStore();
  const networkingStore = useNetworkingStore();

  useEffect(() => {
    if (networkingStore.isUnauthorized) {
      showPopup(rootStore, "Session expired. Please sign in again.", "error");
      navigateHelper.navigateToSignIn();
    }
  }, [networkingStore.isUnauthorized, navigateHelper, rootStore]);

  useEffect(() => {
    if (networkingStore.isAPIErrored) {
      navigateHelper.navigateTo500();
    }
  }, [networkingStore.isAPIErrored, navigateHelper]);

  useEffect(() => {
    const token = localStorage.getItem(WEB_TOKEN_COOKIE_NAME);
    if (!token || token === "undefined" || token === "null") {
      navigateHelper.navigateToSignIn();
    } else if (token !== "undefined" && token !== "null") {
      console.log("token", token);
      navigateHelper.navigateToHome();
    }
    return networkingStore.reset;
  }, [navigateHelper, networkingStore]);

  return (
    <Stack height="100%">
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={rootStore.showFeatureInDevPopup}
        message="This feature is still under development."
      />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={rootStore.isPopupOpen}
        message={rootStore.popupMessage}
      >
        <Alert severity={rootStore.popupVariant} variant="filled">
          {rootStore.popupMessage}
        </Alert>
      </Snackbar>
      <Outlet />
    </Stack>
  );
});
