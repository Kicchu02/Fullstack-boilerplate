import axios from "axios";
import { BASE_URL } from "./constants";
import { Endpoints } from "./stores/NetworkingStore";

// showPopup and showFeatureInDevPopup live in stores/UiStore.ts, next to the state they
// set. This module is only the axios wrapper layer.

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
