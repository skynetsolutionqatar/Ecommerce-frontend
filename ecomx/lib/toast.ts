import { createElement } from "react";
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

/** Info toast that navigates when clicked (e.g. low-stock → inventory). */
export function showNavigableInfo(
  message: string,
  onNavigate: () => void,
  options?: ToastOptions
) {
  return toast.custom(
    (t) =>
      createElement(
        "button",
        {
          type: "button",
          className:
            "flex w-full max-w-md cursor-pointer items-start gap-2 rounded-lg bg-white px-4 py-3 text-left text-sm text-gray-800 shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:text-gray-100 dark:ring-white/10",
          onClick: () => {
            toast.dismiss(t.id);
            onNavigate();
          },
        },
        createElement("span", { "aria-hidden": true }, "ℹ️"),
        createElement(
          "span",
          { className: "min-w-0 flex-1" },
          message,
          createElement(
            "span",
            { className: "mt-0.5 block text-xs font-medium text-blue-600 dark:text-blue-400" },
            "Tap to open inventory"
          )
        )
      ),
    { duration: options?.duration ?? 10_000, ...options }
  );
}
