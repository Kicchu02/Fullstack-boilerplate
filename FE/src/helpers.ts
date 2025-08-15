import axios from "axios";
import { getRoot, type IAnyStateTreeNode } from "mobx-state-tree";
import { BASE_URL } from "./constants";
import { Endpoints } from "./stores/NetworkingStore";
import type { PopupVariant, RootStore } from "./stores/RootStore";

export const showFeatureInDevPopup = (store: IAnyStateTreeNode): void => {
  const rootStore = getRoot<typeof RootStore>(store);
  rootStore.setShowFeatureInDevPopup(true);
  setTimeout(() => {
    rootStore.setShowFeatureInDevPopup(false);
  }, 3000);
};

export const showPopup = (
  store: IAnyStateTreeNode,
  message: string,
  variant: PopupVariant
): void => {
  const rootStore = getRoot<typeof RootStore>(store);
  rootStore.setPopupMessage(message);
  rootStore.setPopupVariant(variant);
  rootStore.setIsPopupOpen(true);
  setTimeout(() => {
    rootStore.setIsPopupOpen(false);
  }, 3000);
};

type HttpMethod = "get" | "post" | "put" | "delete";
type EndpointValue = (typeof Endpoints)[keyof typeof Endpoints];

const apiRequest = (
  method: HttpMethod,
  endpoint: EndpointValue,
  data: unknown = {}
) => {
  const url = `${BASE_URL}${endpoint}`;
  const config = { withCredentials: true };
  if (method === "get" || method === "delete") {
    return axios[method](url, config);
  }
  return axios[method](url, data, config);
};

export const postAPI = (endpoint: EndpointValue, data: unknown = {}) =>
  apiRequest("post", endpoint, data);

export const getAPI = (endpoint: EndpointValue, data: unknown = {}) =>
  apiRequest("get", endpoint, data);

export const putAPI = (endpoint: EndpointValue, data: unknown = {}) =>
  apiRequest("put", endpoint, data);

export const deleteAPI = (endpoint: EndpointValue, data: unknown = {}) =>
  apiRequest("delete", endpoint, data);
