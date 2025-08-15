import axios from "axios";
import {
  applySnapshot,
  getSnapshot,
  types,
  type Instance,
} from "mobx-state-tree";

export const Endpoints = {
  SIGN_UP: "/user/signUp",
  SIGN_IN: "/user/signIn",
  SIGN_OUT: "/user/signOut",
  DUMMY: "/dummy/dummy",
} as const;

export const NetworkingStore = types
  .model("NetworkingStore", {
    errorCode: types.maybe(types.number),
  })
  .volatile(() => ({
    initialState: {} as ReturnType<typeof getSnapshot>,
  }))
  .actions((store) => ({
    setErrorCode: (errorCode: number) => {
      store.errorCode = errorCode;
    },
  }))
  .actions((store) => ({
    afterCreate: (): void => {
      store.initialState = getSnapshot(store);
      axios.interceptors.response.use(
        (response) => response,
        (error) => {
          console.log("error", error.status);
          store.setErrorCode(error.status as number);
          console.log("store.errorCode", store.errorCode);
          return Promise.reject(error);
        }
      );
    },

    reset: (): void => {
      applySnapshot(store, store.initialState);
    },
  }))
  .views((store) => ({
    get isUnauthorized(): boolean {
      return store.errorCode === 401;
    },
    get isAPIErrored(): boolean {
      return store.errorCode === 500;
    },
  }));

export const createNetworkingStore = (): Instance<typeof NetworkingStore> => {
  return NetworkingStore.create({});
};
