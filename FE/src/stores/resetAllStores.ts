import { useHomePageStore } from "./HomePageStore";
import { useNetworkingStore } from "./NetworkingStore";
import { useSignInPageStore } from "./SignInPageStore";
import { useSignUpPageStore } from "./SignUpPageStore";
import { useUiStore } from "./UiStore";

/**
 * Restores every store to its initial state.
 *
 * Zustand stores are module singletons rather than per-render instances, so state survives
 * between tests unless something clears it. Called from the Vitest setup file's afterEach.
 */
export const resetAllStores = (): void => {
  useUiStore.getState().reset();
  useNetworkingStore.getState().reset();
  useSignInPageStore.getState().reset();
  useSignUpPageStore.getState().reset();
  useHomePageStore.getState().reset();
};
