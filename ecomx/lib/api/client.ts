import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_CONFIG, AUTH_ROUTES, TOKEN_KEYS } from "@/lib/config";
import { AUTH_PATH, HTTP_STATUS } from "@/lib/Constant";
import {
  AUTH_SESSION_REASON,
  shouldSkipAuthRefresh,
} from "@/lib/api/auth-errors";
import { useAuthStore } from "@/store/auth.store";
import type { ApiResponse } from "@/types/api.types";
import type { AuthTokens } from "@/types/auth.types";
import { toQueryParams } from "@/lib/api/query-params";

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (API_CONFIG.tenantId) {
    config.headers.set("x-tenant-id", API_CONFIG.tenantId);
  }

  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEYS.access);
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // Let the browser set multipart boundary — default json Content-Type breaks uploads
  if (config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }

  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const refreshToken = localStorage.getItem(TOKEN_KEYS.refresh);
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<ApiResponse<AuthTokens>>(
      `${API_CONFIG.baseURL}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
          ...(API_CONFIG.tenantId ? { "x-tenant-id": API_CONFIG.tenantId } : {}),
        },
      }
    );

    const { accessToken, refreshToken: newRefresh } = data.data;
    localStorage.setItem(TOKEN_KEYS.access, accessToken);
    localStorage.setItem(TOKEN_KEYS.refresh, newRefresh);
    return accessToken;
  } catch {
    localStorage.removeItem(TOKEN_KEYS.access);
    localStorage.removeItem(TOKEN_KEYS.refresh);
    useAuthStore.getState().clearAuth();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && original && !original._retry) {
      if (shouldSkipAuthRefresh(original.url)) {
        return Promise.reject(error);
      }

      original._retry = true;

      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.set("Authorization", `Bearer ${newToken}`);
        return apiClient(original);
      }

      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        const onAuthPage = path === AUTH_PATH.LOGIN || path === AUTH_PATH.REGISTER;
        if (!onAuthPage) {
          const redirect = encodeURIComponent(`${path}${window.location.search}`);
          window.location.replace(
            `${AUTH_ROUTES.login}?reason=${AUTH_SESSION_REASON}&redirect=${redirect}`
          );
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

export async function apiGet<T>(url: string, params?: Record<string, unknown>) {
  const { data } = await apiClient.get<ApiResponse<T>>(url, { params: toQueryParams(params) });
  return data;
}

export async function apiPost<T>(url: string, body?: unknown) {
  const { data } = await apiClient.post<ApiResponse<T>>(url, body);
  return data;
}

export async function apiPatch<T>(url: string, body?: unknown) {
  const { data } = await apiClient.patch<ApiResponse<T>>(url, body);
  return data;
}

export async function apiDelete<T>(url: string) {
  const { data } = await apiClient.delete<ApiResponse<T>>(url);
  return data;
}

export function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
