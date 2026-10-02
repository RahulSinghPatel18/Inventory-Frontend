import axios from "axios";

import { storage } from "../utils/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,

  headers: {
    "Content-Type": "application/json"
  }
});

const inFlightGetRequests = new Map();

export const get = (url, config = {}) => {
  const requestConfig = { ...config, method: "get", url };
  const requestUrl = api.getUri(requestConfig);
  const [path, query = ""] = requestUrl.split("?");
  const normalizedQuery = query
    .split("&")
    .filter(Boolean)
    .sort()
    .join("&");
  const requestKey = `${storage.getToken() || ""}:${path}?${normalizedQuery}`;
  const existingRequest = inFlightGetRequests.get(requestKey);

  if (existingRequest) {
    return existingRequest;
  }

  const request = api.get(url, config).finally(() => {
    inFlightGetRequests.delete(requestKey);
  });
  inFlightGetRequests.set(requestKey, request);

  return request;
};

api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      storage.removeToken();

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;