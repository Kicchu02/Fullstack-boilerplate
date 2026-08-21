import { AxiosError } from "axios";
import { create } from "zustand";
import { EMPTY_STRING } from "../constants";
import { postAPI } from "../helpers";
import { Endpoints } from "./NetworkingStore";

type SignUpState = {
  email: string;
  password: string;
  isLoading: boolean;
  isEmailAlreadyExists: boolean;
  isEmailInvalid: boolean;
  isPasswordInvalid: boolean;
};

type SignUpActions = {
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  signUp: () => Promise<void>;
  reset: () => void;
};

const initialState: SignUpState = {
  email: EMPTY_STRING,
  password: EMPTY_STRING,
  isLoading: false,
  isEmailAlreadyExists: false,
  isEmailInvalid: false,
  isPasswordInvalid: false,
};

export const useSignUpPageStore = create<SignUpState & SignUpActions>()(
  (set, get) => ({
    ...initialState,
    setEmail: (email) => set({ email }),
    setPassword: (password) => set({ password }),
    reset: () => set(initialState),

    signUp: async () => {
      set({
        isLoading: true,
        isEmailAlreadyExists: false,
        isEmailInvalid: false,
        isPasswordInvalid: false,
      });
      try {
        await postAPI(Endpoints.SIGN_UP, {
          emailId: { emailId: get().email },
          password: get().password,
        });
      } catch (e) {
        const error = e as AxiosError;
        if (error.response) {
          const { status, data } = error.response;
          switch (status) {
            case 409:
              set({ isEmailAlreadyExists: true });
              break;
            case 400:
              if (data === "Password is insecure.") {
                set({ isPasswordInvalid: true });
              } else {
                set({ isEmailInvalid: true });
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

export const selectIsButtonDisabled = (s: SignUpState): boolean =>
  s.email.trim() === EMPTY_STRING || s.password.trim() === EMPTY_STRING;

export const selectIsAPIErrored = (s: SignUpState): boolean =>
  s.isEmailAlreadyExists || s.isEmailInvalid || s.isPasswordInvalid;
