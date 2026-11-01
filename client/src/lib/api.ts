import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { ApiError, type ApiEnvelope } from "../types/api";
import { useAuthStore } from "../stores/auth.store";

const AUTH_URLS = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/resend-otp",
];

// Full-page navigations (e.g. the Google OAuth redirect) need the same base
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error.response?.status ?? 0;
    const raw = error.response?.data as
      | { message?: string | string[] }
      | undefined;

    let message = "Cannot reach the server. Check your connection.";
    if (status === 429) {
      message = "Too many attempts. Please wait a minute and try again.";
    } else if (raw && typeof raw === "object" && "message" in raw) {
      message = Array.isArray(raw.message)
        ? raw.message.join(" · ")
        : raw.message || message;
    } else if (error.response) {
      message = `Request failed (${status})`;
    }

    const url = error.config?.url ?? "";
    if (status === 401 && !AUTH_URLS.some((u) => url.includes(u))) {
      useAuthStore.getState().clear();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    }

    return Promise.reject(new ApiError(status, message));
  },
);

async function unwrap<T>(
  promise: Promise<{ data: ApiEnvelope<T> }>,
): Promise<T> {
  const res = await promise;
  return res.data.data as T;
}

export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    unwrap<T>(instance.get<ApiEnvelope<T>>(url, config)),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    unwrap<T>(instance.post<ApiEnvelope<T>>(url, body, config)),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    unwrap<T>(instance.put<ApiEnvelope<T>>(url, body, config)),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    unwrap<T>(instance.patch<ApiEnvelope<T>>(url, body, config)),
  delete: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    unwrap<T>(instance.delete<ApiEnvelope<T>>(url, { ...config, data: body })),
};

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

export function errorMessage(e: unknown): string {
  return isApiError(e) ? e.message : "Something went wrong. Try again.";
}
