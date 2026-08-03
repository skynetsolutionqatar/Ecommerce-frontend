import type { AxiosError } from "axios";
import { HTTP_STATUS } from "@/lib/Constant";
import type { ApiResponse } from "@/types/api.types";

type ApiErrorBody = ApiResponse<unknown> & {
  error?: string;
};

function formatValidationErrors(errors: Record<string, string[]>): string | null {
  const messages = Object.values(errors)
    .flat()
    .map((msg) => msg.trim())
    .filter(Boolean);

  if (messages.length === 0) return null;
  return messages.slice(0, 3).join(" · ");
}

function messageFromStatus(status?: number): string | null {
  switch (status) {
    case HTTP_STATUS.UNAUTHORIZED:
      return "Please sign in to continue.";
    case HTTP_STATUS.FORBIDDEN:
      return "You do not have permission to perform this action.";
    case HTTP_STATUS.NOT_FOUND:
      return "The requested resource was not found.";
    case HTTP_STATUS.CONFLICT:
      return "This action conflicts with existing data.";
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return "Please check your input and try again.";
    case HTTP_STATUS.TOO_MANY_REQUESTS:
      return "Too many requests. Please wait and try again.";
    default:
      if (status && status >= 500) {
        return "Server error. Please try again later.";
      }
      return null;
  }
}

/** Extract a user-facing message from API / network errors. */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (typeof error === "string" && error.trim()) return error.trim();

  if (error instanceof Error && error.message.trim()) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    if (!axiosError.isAxiosError) {
      return error.message.trim();
    }
  }

  const axiosError = error as AxiosError<ApiErrorBody>;
  if (axiosError?.isAxiosError) {
    if (!axiosError.response) {
      if (axiosError.code === "ECONNABORTED") {
        return "Request timed out. Please try again.";
      }
      return "Network error. Check your connection and try again.";
    }

    const data = axiosError.response.data;
    const validationMsg =
      data?.errors && typeof data.errors === "object"
        ? formatValidationErrors(data.errors)
        : null;

    if (validationMsg) return validationMsg;

    const apiMessage = data?.message?.trim() || data?.error?.trim();
    if (apiMessage) return apiMessage;

    const statusMsg = messageFromStatus(axiosError.response.status);
    if (statusMsg) return statusMsg;
  }

  if (error && typeof error === "object") {
    const generic = error as {
      response?: { data?: ApiErrorBody; status?: number };
      message?: string;
    };

    const data = generic.response?.data;
    const validationMsg =
      data?.errors && typeof data.errors === "object"
        ? formatValidationErrors(data.errors)
        : null;
    if (validationMsg) return validationMsg;

    const apiMessage = data?.message?.trim() || data?.error?.trim();
    if (apiMessage) return apiMessage;

    const statusMsg = messageFromStatus(generic.response?.status);
    if (statusMsg) return statusMsg;

    if (generic.message?.trim()) return generic.message.trim();
  }

  return fallback;
}
