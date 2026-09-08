import { apiGet, apiPost } from "./client";
import type {
  AuthResponse,
  AuthUser,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from "@/types/auth.types";

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

  changePassword: (payload: ChangePasswordPayload) =>
    apiPost<Record<string, never>>("/auth/change-password", payload),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiPost<{ message: string }>("/auth/forgot-password", payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiPost<{ message: string }>("/auth/reset-password", payload),
};
