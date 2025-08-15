import {
  applySnapshot,
  flow,
  getSnapshot,
  types,
  type Instance,
} from "mobx-state-tree";
import { EMPTY_STRING, WEB_TOKEN_COOKIE_NAME } from "../constants";
import { postAPI } from "../helpers";
import { Endpoints } from "./NetworkingStore";

export const HomePageStore = types
  .model("HomePageStore", {
    isLoading: types.optional(types.boolean, false),
    dummyData: types.optional(types.string, EMPTY_STRING),
    isSignOutLoading: types.optional(types.boolean, false),
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
    dummyAPI: flow(function* () {
      store.isLoading = true;
      try {
        const response = yield postAPI(Endpoints.DUMMY);
        store.dummyData = response.data.message;
      } catch (e) {
        console.error(e);
      } finally {
        store.isLoading = false;
      }
    }),
    signOut: flow(function* () {
      store.isSignOutLoading = true;
      try {
        yield postAPI(Endpoints.SIGN_OUT);
        localStorage.removeItem(WEB_TOKEN_COOKIE_NAME);
      } catch (e) {
        console.error(e);
      } finally {
        store.isSignOutLoading = false;
      }
    }),
  }));

export const createHomePageStore = (): Instance<typeof HomePageStore> => {
  return HomePageStore.create({});
};
