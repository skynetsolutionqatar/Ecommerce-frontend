import type { AxiosError } from "axios";
import { HTTP_STATUS } from "@/lib/Constant";
import { getValidationErrorMessage } from "@/lib/api/errors";
import type { ApiResponse } from "@/types/api.types";

type ApiErrorBody = ApiResponse<unknown> & { error?: string };

export const AUTH_SESSION_REASON = "session_expired";

/** One message for sign-in failures — invalid credentials and expired session. */
export const AUTH_ERROR = {
  signInFailed:
    "Unable to sign in. Your session may have expired, or your email or password is incorrect. Please try again.",
  registerFailed: "Unable to create account. Please check your details and try again.",
  changePasswordFailed:
    "Unable to change password. Check your current password and try again.",
  forgotPasswordFailed: "Unable to send reset link. Please try again.",
  resetPasswordFailed: "Unable to reset password. The link may be invalid or expired.",
  network: "Network error. Check your connection and try again.",
  timeout: "Request timed out. Please try again.",
} as const;

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return /\/auth\/(login|register|refresh|google-login)(\/|$|\?)/.test(url);
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
  action:
    | "login"
    | "register"
    | "googleLogin"
    | "changePassword"
    | "forgotPassword"
    | "resetPassword" = "login"
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
    const validationMsg = getValidationErrorMessage(data);
    const apiMessage = data?.message?.trim() || data?.error?.trim();

    if (validationMsg) return validationMsg;

    if (status === HTTP_STATUS.UNAUTHORIZED) {
      return action === "changePassword"
        ? AUTH_ERROR.changePasswordFailed
        : AUTH_ERROR.signInFailed;
    }

    if (status === HTTP_STATUS.CONFLICT) {
      return apiMessage || "An account with this email already exists.";
    }

    if (status === HTTP_STATUS.UNPROCESSABLE_ENTITY) {
      return apiMessage || AUTH_ERROR.registerFailed;
    }

    if (apiMessage) return apiMessage;
  }

  if (action === "register") return AUTH_ERROR.registerFailed;
  if (action === "changePassword") return AUTH_ERROR.changePasswordFailed;
  if (action === "forgotPassword") return AUTH_ERROR.forgotPasswordFailed;
  if (action === "resetPassword") return AUTH_ERROR.resetPasswordFailed;
  return AUTH_ERROR.signInFailed;
}
