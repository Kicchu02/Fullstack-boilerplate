import { create } from "zustand";
import { EMPTY_STRING, WEB_TOKEN_COOKIE_NAME } from "../constants";
import { postAPI } from "../helpers";
import { Endpoints } from "./NetworkingStore";

type HomeState = {
  isLoading: boolean;
  dummyData: string;
  isSignOutLoading: boolean;
};

type HomeActions = {
  dummyAPI: () => Promise<void>;
  signOut: () => Promise<void>;
  reset: () => void;
};

const initialState: HomeState = {
  isLoading: false,
  dummyData: EMPTY_STRING,
  isSignOutLoading: false,
};

export const useHomePageStore = create<HomeState & HomeActions>()((set) => ({
  ...initialState,
  reset: () => set(initialState),

  dummyAPI: async () => {
    set({ isLoading: true });
    try {
      const response = await postAPI(Endpoints.DUMMY);
      set({ dummyData: response.data.message });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isSignOutLoading: true });
    try {
      await postAPI(Endpoints.SIGN_OUT);
      localStorage.removeItem(WEB_TOKEN_COOKIE_NAME);
    } catch (e) {
      console.error(e);
    } finally {
      set({ isSignOutLoading: false });
    }
  },
}));
