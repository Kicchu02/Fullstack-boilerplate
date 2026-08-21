import { Alert, Flex } from "antd";
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
    <Flex vertical style={{ height: "100%" }}>
      {/*
        antd has no Snackbar. Its message/notification APIs are imperative, which would
        mean firing a toast from inside a render or an effect; keeping these declarative
        and driven by UiStore preserves the previous behaviour and stays testable.
        pointerEvents is off on the overlay so it never blocks the page beneath it.
      */}
      {(showFeatureInDevPopup || isPopupOpen) && (
        <Flex
          vertical
          gap={8}
          align="center"
          style={{
            position: "fixed",
            top: 16,
            left: 0,
            right: 0,
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          {showFeatureInDevPopup && (
            <Alert
              message="This feature is still under development."
              type="info"
              showIcon
            />
          )}
          {isPopupOpen && (
            <Alert message={popupMessage} type={popupVariant} showIcon />
          )}
        </Flex>
      )}
      <Outlet />
    </Flex>
  );
};
