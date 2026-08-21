import { AxiosError } from "axios";
import { create } from "zustand";
import { EMPTY_STRING, WEB_TOKEN_COOKIE_NAME } from "../constants";
import { postAPI } from "../helpers";
import { Endpoints } from "./NetworkingStore";

type SignInState = {
  email: string;
  password: string;
  isLoading: boolean;
  isEmailInvalid: boolean;
  isPasswordInvalid: boolean;
};

type SignInActions = {
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  signIn: () => Promise<void>;
  reset: () => void;
};

const initialState: SignInState = {
  email: EMPTY_STRING,
  password: EMPTY_STRING,
  isLoading: false,
  isEmailInvalid: false,
  isPasswordInvalid: false,
};

export const useSignInPageStore = create<SignInState & SignInActions>()(
  (set, get) => ({
    ...initialState,
    setEmail: (email) => set({ email }),
    setPassword: (password) => set({ password }),
    reset: () => set(initialState),

    signIn: async () => {
      set({ isLoading: true, isEmailInvalid: false, isPasswordInvalid: false });
      try {
        const response = await postAPI(Endpoints.SIGN_IN, {
          emailId: { emailId: get().email },
          password: get().password,
        });
        localStorage.setItem(WEB_TOKEN_COOKIE_NAME, response.data.webToken);
      } catch (e) {
        const error = e as AxiosError;
        if (error.response) {
          const { status, data } = error.response;
          switch (status) {
            case 400:
              set({ isEmailInvalid: true });
              break;
            case 401:
              if (data === "Email doesn't exist.") {
                set({ isEmailInvalid: true });
              } else if (data === "Invalid password.") {
                set({ isPasswordInvalid: true });
              }
              break;
          }
        }
      } finally {
        set({ isLoading: false });
      }
    },
  }),
);

// Derived state. These were MST `.views` getters; as selectors they stay out of the stored
// state and each returns a primitive, so a component subscribing to one only re-renders
// when that boolean actually flips.
export const selectIsButtonDisabled = (s: SignInState): boolean =>
  s.email.trim() === EMPTY_STRING || s.password.trim() === EMPTY_STRING;

export const selectIsAPIErrored = (s: SignInState): boolean =>
  s.isEmailInvalid || s.isPasswordInvalid;
