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
  if (config.signal || config.cancelToken) {
    return api.get(url, config);
  }

  const requestUrl = api.getUri({ ...config, method: "get", url });
  const requestKey = `${storage.getToken() || ""}:${requestUrl}`;
  const existingRequest = inFlightGetRequests.get(requestKey);

  if (existingRequest) {
    return existingRequest;
  }

  const request = api.get(url, config).finally(() => {
    if (inFlightGetRequests.get(requestKey) === request) {
      inFlightGetRequests.delete(requestKey);
    }
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
    const requestUrl = error.config?.url || "";
    const isPublicAuthRequest =
      requestUrl.endsWith("/users/Register") ||
      requestUrl.endsWith("/users/VerifyRegistrationOtp") ||
      requestUrl.endsWith("/users/ResendRegistrationOtp") ||
      requestUrl.endsWith("/users/Login") ||
      requestUrl.endsWith("/users/Google") ||
      requestUrl.endsWith("/users/Google/Register") ||
      requestUrl.endsWith("/users/VerifyTwoFactor");

    if (error.response?.status === 401 && !isPublicAuthRequest) {
      if (storage.getToken()) {
        storage.removeToken();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;