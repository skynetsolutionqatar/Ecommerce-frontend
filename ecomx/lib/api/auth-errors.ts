import type { AxiosError } from "axios";
import { HTTP_STATUS } from "@/lib/Constant";
import { getValidationErrorMessage } from "@/lib/api/errors";
import type { ApiResponse } from "@/types/api.types";

type ApiErrorBody = ApiResponse<unknown> & { error?: string };

export const AUTH_SESSION_REASON = "session_expired";

/** Default message when email/password sign-in fails. */
export const AUTH_ERROR = {
  signInFailed:
    "Unable to sign in. Your email or password is incorrect. Please try again.",
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
  if (/\/auth\/msg91\//.test(url)) return true;
  return /\/auth\/(login|register|refresh|google\/login)(\/|$|\?)/.test(url);
}

/** Skip token refresh for login/register failures — avoids false session-expired redirects. */
export function shouldSkipAuthRefresh(url?: string): boolean {
  return isAuthEndpoint(url);
}

export function isAuthSessionReason(reason: string | null | undefined): boolean {
  return reason === AUTH_SESSION_REASON;
}

/** Shown on admin login after session-expired redirect (not used on store). */
export const AUTH_SESSION_EXPIRED_MESSAGE =
  "Your session has expired. Please sign in again to continue.";

export function getSessionExpiredMessage(): string {
  return AUTH_SESSION_EXPIRED_MESSAGE;
}

/** Single resolver — login, register, and validation strings. */
export function getAuthErrorMessage(
  error: unknown,
  action:
    | "login"
    | "register"
    | "googleLogin"
    | "changePassword"
    | "forgotPassword"
    | "resetPassword"
    | "phoneLogin" = "login"
): string {
  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  if (error instanceof Error && !(error as AxiosError).isAxiosError && error.message.trim()) {
    return error.message.trim();
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

    if (
      action === "phoneLogin" &&
      apiMessage &&
      /not configured|captcha/i.test(apiMessage)
    ) {
      return "Phone sign-in is not available right now. Sign in with email or Google instead.";
    }

    if (status === HTTP_STATUS.UNAUTHORIZED) {
      if (action === "phoneLogin") {
        return apiMessage || "That code is incorrect or has expired. Request a new one.";
      }
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

  if (action === "phoneLogin") {
    return "Could not verify that phone number. Please try again.";
  }
  if (action === "register") return AUTH_ERROR.registerFailed;
  if (action === "changePassword") return AUTH_ERROR.changePasswordFailed;
  if (action === "forgotPassword") return AUTH_ERROR.forgotPasswordFailed;
  if (action === "resetPassword") return AUTH_ERROR.resetPasswordFailed;
  return AUTH_ERROR.signInFailed;
}
