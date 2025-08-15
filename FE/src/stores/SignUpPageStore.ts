import { AxiosError } from "axios";
import {
  applySnapshot,
  flow,
  getSnapshot,
  types,
  type Instance,
} from "mobx-state-tree";
import { EMPTY_STRING } from "../constants";
import { postAPI } from "../helpers";
import { Endpoints } from "./NetworkingStore";

export const SignUpPageStore = types
  .model("SignUpPageStore", {
    email: types.optional(types.string, EMPTY_STRING),
    password: types.optional(types.string, EMPTY_STRING),
    isLoading: types.optional(types.boolean, false),
    isEmailAlreadyExists: types.optional(types.boolean, false),
    isEmailInvalid: types.optional(types.boolean, false),
    isPasswordInvalid: types.optional(types.boolean, false),
  })
  .volatile(() => ({
    initialState: {} as ReturnType<typeof getSnapshot>,
  }))
  .actions((store) => ({
    afterCreate: (): void => {
      store.initialState = getSnapshot(store);
    },
    reset: (): void => {
      applySnapshot(store, store.initialState);
    },
    setEmail: (email: string): void => {
      store.email = email;
    },
    setPassword: (password: string): void => {
      store.password = password;
    },
    signUp: flow(function* () {
      store.isLoading = true;
      store.isEmailAlreadyExists = false;
      store.isEmailInvalid = false;
      store.isPasswordInvalid = false;
      try {
        yield postAPI(Endpoints.SIGN_UP, {
          emailId: { emailId: store.email },
          password: store.password,
        });
      } catch (e) {
        const error = e as AxiosError;
        if (error.response) {
          const { status, data } = error.response;
          switch (status) {
            case 409:
              store.isEmailAlreadyExists = true;
              break;
            case 400:
              if (data === "Password is insecure.") {
                store.isPasswordInvalid = true;
              } else {
                store.isEmailInvalid = true;
              }
              break;
          }
        }
      } finally {
        store.isLoading = false;
      }
    }),
  }))
  .views((store) => ({
    get isButtonDisabled(): boolean {
      return (
        store.email.trim() === EMPTY_STRING ||
        store.password.trim() === EMPTY_STRING
      );
    },
    get isAPIErrored(): boolean {
      return (
        store.isEmailAlreadyExists ||
        store.isEmailInvalid ||
        store.isPasswordInvalid
      );
    },
  }));

export const createSignUpPageStore = (): Instance<typeof SignUpPageStore> => {
  return SignUpPageStore.create({});
};
