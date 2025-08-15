import { types } from "mobx-state-tree";
import React from "react";
import { EMPTY_STRING } from "../constants";
import { createHomePageStore, HomePageStore } from "./HomePageStore";
import { createNetworkingStore, NetworkingStore } from "./NetworkingStore";
import { RootStoreContext } from "./RootStoreContext";
import { createSignInPageStore, SignInPageStore } from "./SignInPageStore";
import { createSignUpPageStore, SignUpPageStore } from "./SignUpPageStore";

export type PopupVariant = "success" | "error" | "warning" | "info";

export const RootStore = types
  .model("RootStore", {
    signUpPageStore: SignUpPageStore,
    signInPageStore: SignInPageStore,
    homePageStore: HomePageStore,
    networkingStore: NetworkingStore,
    showFeatureInDevPopup: types.optional(types.boolean, false),
    isPopupOpen: types.optional(types.boolean, false),
    popupMessage: types.optional(types.string, EMPTY_STRING),
    popupVariant: types.optional(
      types.union(
        types.literal("success"),
        types.literal("error"),
        types.literal("warning"),
        types.literal("info")
      ),
      "info"
    ),
  })
  .actions((store) => ({
    setShowFeatureInDevPopup: (showFeatureInDevPopup: boolean): void => {
      store.showFeatureInDevPopup = showFeatureInDevPopup;
    },
    setIsPopupOpen: (isPopupOpen: boolean): void => {
      store.isPopupOpen = isPopupOpen;
    },
    setPopupMessage: (popupMessage: string): void => {
      store.popupMessage = popupMessage;
    },
    setPopupVariant: (popupVariant: PopupVariant): void => {
      store.popupVariant = popupVariant;
    },
  }));

export const RootStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => {
  const store = RootStore.create({
    signUpPageStore: createSignUpPageStore(),
    signInPageStore: createSignInPageStore(),
    homePageStore: createHomePageStore(),
    networkingStore: createNetworkingStore(),
  });
  return (
    <RootStoreContext.Provider value={store}>
      {children}
    </RootStoreContext.Provider>
  );
};
