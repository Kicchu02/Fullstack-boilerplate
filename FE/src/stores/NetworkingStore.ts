import axios from "axios";
import { create } from "zustand";

export const Endpoints = {
  SIGN_UP: "/user/signUp",
  SIGN_IN: "/user/signIn",
  SIGN_OUT: "/user/signOut",
  DUMMY: "/dummy/dummy",
} as const;

type NetworkingState = {
  errorCode: number | undefined;
};

type NetworkingActions = {
  setErrorCode: (errorCode: number) => void;
  reset: () => void;
};

const initialState: NetworkingState = { errorCode: undefined };

/**
 * The global error channel. Every axios failure lands here, and App watches the selectors
 * below to force a sign-in redirect or route to the error page — so API-calling code does
 * not need its own global error handling.
 */
export const useNetworkingStore = create<NetworkingState & NetworkingActions>()(
  (set) => ({
    ...initialState,
    setErrorCode: (errorCode) => set({ errorCode }),
    reset: () => set(initialState),
  }),
);

export const selectIsUnauthorized = (s: NetworkingState): boolean =>
  s.errorCode === 401;

export const selectIsAPIErrored = (s: NetworkingState): boolean =>
  s.errorCode === 500;

// Installed once, when this module is first imported. Keep it at module scope: moving it
// into a component or an effect would register a fresh interceptor on every mount.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    useNetworkingStore.getState().setErrorCode(error.status as number);
    return Promise.reject(error);
  },
);
