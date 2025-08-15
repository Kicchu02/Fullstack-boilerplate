import type { Instance } from "mobx-state-tree";
import { useContext } from "react";
import { HomePageStore } from "./HomePageStore";
import { NetworkingStore } from "./NetworkingStore";
import type { RootStore } from "./RootStore";
import { RootStoreContext } from "./RootStoreContext";
import { SignInPageStore } from "./SignInPageStore";
import { SignUpPageStore } from "./SignUpPageStore";

export function useRootStore(): Instance<typeof RootStore> {
  const store = useContext(RootStoreContext);
  if (store === null) {
    throw new Error("Store cannot be null, please add a context provider");
  }
  return store;
}

export const useNetworkingStore = (): Instance<typeof NetworkingStore> => {
  const store = useRootStore();
  return store.networkingStore;
};

export const useSignUpPageStore = (): Instance<typeof SignUpPageStore> => {
  const store = useRootStore();
  return store.signUpPageStore;
};

export const useSignInPageStore = (): Instance<typeof SignInPageStore> => {
  const store = useRootStore();
  return store.signInPageStore;
};

export const useHomePageStore = (): Instance<typeof HomePageStore> => {
  const store = useRootStore();
  return store.homePageStore;
};
