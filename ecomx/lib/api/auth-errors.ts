import type { AxiosError } from "axios";
import { HTTP_STATUS } from "@/lib/Constant";
import type { ApiResponse } from "@/types/api.types";

type ApiErrorBody = ApiResponse<unknown> & { error?: string };

export const AUTH_SESSION_REASON = "session_expired";

/** One message for sign-in failures — invalid credentials and expired session. */
export const AUTH_ERROR = {
  signInFailed:
    "Unable to sign in. Your session may have expired, or your email or password is incorrect. Please try again.",
  registerFailed: "Unable to create account. Please check your details and try again.",
  network: "Network error. Check your connection and try again.",
  timeout: "Request timed out. Please try again.",
} as const;

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return /\/auth\/(login|register|refresh)(\/|$|\?)/.test(url);
}

/** Skip token refresh for login/register failures — avoids false session-expired redirects. */
export function shouldSkipAuthRefresh(url?: string): boolean {
  return isAuthEndpoint(url);
}

export function isAuthSessionReason(reason: string | null | undefined): boolean {
  return reason === AUTH_SESSION_REASON;
}

export function getSessionExpiredMessage(): string {
  return AUTH_ERROR.signInFailed;
}

/** Single resolver — login, register, session expiry, and validation strings. */
export function getAuthErrorMessage(
  error: unknown,
  action: "login" | "register" = "login"
): string {
  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  const axiosError = error as AxiosError<ApiErrorBody>;

  if (axiosError?.isAxiosError) {
    if (!axiosError.response) {
      if (axiosError.code === "ECONNABORTED") {
        return AUTH_ERROR.timeout;
      }
      return AUTH_ERROR.network;
    }

    const { status, data } = axiosError.response;
    const apiMessage = data?.message?.trim() || data?.error?.trim();

    if (status === HTTP_STATUS.UNAUTHORIZED) {
      return AUTH_ERROR.signInFailed;
    }

    if (status === HTTP_STATUS.CONFLICT) {
      return apiMessage || "An account with this email already exists.";
    }

    if (status === HTTP_STATUS.UNPROCESSABLE_ENTITY) {
      return apiMessage || AUTH_ERROR.registerFailed;
    }

    if (apiMessage) return apiMessage;
  }

  return action === "login" ? AUTH_ERROR.signInFailed : AUTH_ERROR.registerFailed;
}
