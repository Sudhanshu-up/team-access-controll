import axios from "axios";

import { authStorage } from "@/lib/authStorage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * A 401 means the token is missing/invalid/blacklisted — clear local
 * auth state and send the user back to /login. We dispatch a custom
 * event rather than importing the router here, so any part of the app
 * (including outside React) can react to it.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      authStorage.clearToken();
      window.dispatchEvent(new CustomEvent("tac:unauthorized"));
    }
    return Promise.reject(error);
  }
);
