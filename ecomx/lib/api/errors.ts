import type { AxiosError } from "axios";
import { HTTP_STATUS } from "@/lib/Constant";
import type { ApiResponse } from "@/types/api.types";

export type ValidationErrors =
  | Record<string, string[] | string>
  | Array<{ field?: string; message?: string; msg?: string }>;

type ApiErrorBody = ApiResponse<unknown> & {
  error?: string;
};

function getErrorBody(error: unknown): ApiErrorBody | null {
  if (typeof error === "string") return null;

  const axiosError = error as AxiosError<ApiErrorBody>;
  if (axiosError?.isAxiosError && axiosError.response?.data) {
    return axiosError.response.data;
  }

  const generic = error as { response?: { data?: ApiErrorBody } };
  return generic.response?.data ?? null;
}

export function formatValidationErrors(errors: ValidationErrors): string | null {
  const messages: string[] = [];

  if (Array.isArray(errors)) {
    for (const item of errors) {
      const msg = item.message ?? item.msg;
      if (typeof msg === "string" && msg.trim()) messages.push(msg.trim());
    }
  } else {
    for (const value of Object.values(errors)) {
      const list = Array.isArray(value) ? value : [value];
      for (const msg of list) {
        if (typeof msg === "string" && msg.trim()) messages.push(msg.trim());
      }
    }
  }

  if (messages.length === 0) return null;
  return messages.slice(0, 3).join(" · ");
}

export function getValidationErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const errors = (data as ApiErrorBody).errors;
  if (!errors || typeof errors !== "object") return null;
  return formatValidationErrors(errors);
}

export function getApiFieldErrors(error: unknown): Record<string, string> {
  const data = getErrorBody(error);
  if (!data?.errors || typeof data.errors !== "object") return {};

  const fieldErrors: Record<string, string> = {};

  if (Array.isArray(data.errors)) {
    for (const item of data.errors) {
      const field = item.field?.trim();
      const message = (item.message ?? item.msg)?.trim();
      if (field && message && !fieldErrors[field]) {
        fieldErrors[field] = message;
      }
    }
    return fieldErrors;
  }

  for (const [field, value] of Object.entries(data.errors)) {
    const list = Array.isArray(value) ? value : [value];
    const message = list.find((msg) => typeof msg === "string" && msg.trim()) as
      | string
      | undefined;
    if (message?.trim()) {
      fieldErrors[field] = message.trim();
    }
  }

  return fieldErrors;
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
    const validationMsg = getValidationErrorMessage(data);
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
    const validationMsg = getValidationErrorMessage(data);
    if (validationMsg) return validationMsg;

    const apiMessage = data?.message?.trim() || data?.error?.trim();
    if (apiMessage) return apiMessage;

    const statusMsg = messageFromStatus(generic.response?.status);
    if (statusMsg) return statusMsg;

    if (generic.message?.trim()) return generic.message.trim();
  }

  return fallback;
}
