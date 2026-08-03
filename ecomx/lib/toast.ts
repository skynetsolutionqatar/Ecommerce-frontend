import toast, { type ToastOptions } from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api/errors";

const baseOptions: ToastOptions = {
  duration: 4000,
};

export function showSuccess(message: string, options?: ToastOptions) {
  return toast.success(message, { ...baseOptions, ...options });
}

export function showError(error: unknown, fallback?: string, options?: ToastOptions) {
  return toast.error(getApiErrorMessage(error, fallback ?? "Something went wrong"), {
    ...baseOptions,
    duration: 5000,
    ...options,
  });
}

export function showInfo(message: string, options?: ToastOptions) {
  return toast(message, { ...baseOptions, icon: "ℹ️", ...options });
}
