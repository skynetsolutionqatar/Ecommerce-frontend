import { apiGet, apiPost } from "./client";
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from "@/types/auth.types";

export const authApi = {
  login: (payload: LoginPayload) =>
    apiPost<AuthResponse>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    apiPost<AuthResponse>("/auth/register", payload),

  logout: () => apiPost<Record<string, never>>("/auth/logout"),

  getMe: () => apiGet<{ customer: AuthUser }>("/auth/me"),

  refresh: (refreshToken: string) =>
    apiPost<{ accessToken: string; refreshToken: string }>("/auth/refresh", {
      refreshToken,
    }),
};
