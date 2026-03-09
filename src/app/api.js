
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request: Attach JWT token ──────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: Handle 401 (expired / invalid token) ───────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale credentials and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes("/auth/sign-in")) {
        window.location.href = "/auth/sign-in";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
