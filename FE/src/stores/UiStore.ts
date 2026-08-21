import { create } from "zustand";
import { POPUP_DURATION } from "../constants";

export type PopupVariant = "success" | "error" | "warning" | "info";

type UiState = {
  showFeatureInDevPopup: boolean;
  isPopupOpen: boolean;
  popupMessage: string;
  popupVariant: PopupVariant;
};

type UiActions = {
  setShowFeatureInDevPopup: (value: boolean) => void;
  setIsPopupOpen: (value: boolean) => void;
  setPopupMessage: (message: string) => void;
  setPopupVariant: (variant: PopupVariant) => void;
  reset: () => void;
};

// Held separately from the store body so reset() has something to restore. Every store in
// this directory follows the same shape.
const initialState: UiState = {
  showFeatureInDevPopup: false,
  isPopupOpen: false,
  popupMessage: "",
  popupVariant: "info",
};

// Dismiss timers are tracked so a second popup cannot be closed early by the first one's
// pending timeout, and so reset() can cancel anything in flight rather than leaving a
// timer to fire into a torn-down tree.
let popupTimer: ReturnType<typeof setTimeout> | undefined;
let featureInDevTimer: ReturnType<typeof setTimeout> | undefined;

const clearPopupTimers = (): void => {
  if (popupTimer !== undefined) clearTimeout(popupTimer);
  if (featureInDevTimer !== undefined) clearTimeout(featureInDevTimer);
  popupTimer = undefined;
  featureInDevTimer = undefined;
};

/**
 * Global feedback state — the snackbars rendered by App. Not page-scoped, which is why it
 * lives in its own store rather than alongside a page's state.
 */
export const useUiStore = create<UiState & UiActions>()((set) => ({
  ...initialState,
  setShowFeatureInDevPopup: (showFeatureInDevPopup) => set({ showFeatureInDevPopup }),
  setIsPopupOpen: (isPopupOpen) => set({ isPopupOpen }),
  setPopupMessage: (popupMessage) => set({ popupMessage }),
  setPopupVariant: (popupVariant) => set({ popupVariant }),
  reset: () => {
    clearPopupTimers();
    set(initialState);
  },
}));

/**
 * Show a transient message. Callable from anywhere, including outside React, because the
 * store is reachable without a provider.
 */
export const showPopup = (message: string, variant: PopupVariant): void => {
  const { setPopupMessage, setPopupVariant, setIsPopupOpen } = useUiStore.getState();
  setPopupMessage(message);
  setPopupVariant(variant);
  setIsPopupOpen(true);
  if (popupTimer !== undefined) clearTimeout(popupTimer);
  popupTimer = setTimeout(() => {
    popupTimer = undefined;
    useUiStore.getState().setIsPopupOpen(false);
  }, POPUP_DURATION);
};

export const showFeatureInDevPopup = (): void => {
  useUiStore.getState().setShowFeatureInDevPopup(true);
  if (featureInDevTimer !== undefined) clearTimeout(featureInDevTimer);
  featureInDevTimer = setTimeout(() => {
    featureInDevTimer = undefined;
    useUiStore.getState().setShowFeatureInDevPopup(false);
  }, POPUP_DURATION);
};
