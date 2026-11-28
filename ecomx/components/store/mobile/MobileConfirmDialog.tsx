"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CircleHelp, Trash2 } from "lucide-react";
import { registerConfirmDialog, type ConfirmRemovalOptions } from "@/lib/store/confirm-dialog";

/** Phone confirm sheet for sign out, cart remove, and wishlist remove. */
export default function MobileConfirmDialog() {
  const [options, setOptions] = useState<ConfirmRemovalOptions | null>(null);
  const optionsRef = useRef<ConfirmRemovalOptions | null>(null);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const dismiss = useCallback((reason: "cancel" | "confirm") => {
    const current = optionsRef.current;
    optionsRef.current = null;
    setOptions(null);
    if (!current) return;
    if (reason === "confirm") current.onConfirm();
    else current.onCancel?.();
  }, []);

  useEffect(() => {
    registerConfirmDialog((next) => {
      setOptions(next);
    });
    return () => registerConfirmDialog(null);
  }, []);

  useEffect(() => {
    if (!options) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss("cancel");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [dismiss, options]);

  if (!options) return null;

  const destructive = (options.tone ?? "destructive") === "destructive";
  const confirmLabel = options.confirmLabel ?? "Remove";
  const cancelLabel = options.cancelLabel ?? "Keep item";

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center px-6 md:hidden">
      <button
        type="button"
        className="absolute inset-0 border-0 bg-black/50"
        aria-label="Dismiss"
        onClick={() => dismiss("cancel")}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="mobile-confirm-title"
        aria-describedby="mobile-confirm-message"
        className="relative flex w-full max-w-[340px] flex-col items-center gap-2 rounded-[24px] bg-white px-5 pb-5 pt-6"
      >
        <span
          className={`mb-1 flex h-14 w-14 items-center justify-center rounded-full ${
            destructive ? "bg-red-50 text-red-600" : "bg-[#e8eef8] text-[#0a255d]"
          }`}
        >
          {destructive ? (
            <Trash2 className="h-[26px] w-[26px]" strokeWidth={2} />
          ) : (
            <CircleHelp className="h-[26px] w-[26px]" strokeWidth={2} />
          )}
        </span>
        <h2 id="mobile-confirm-title" className="text-center text-lg font-extrabold text-gray-900">
          {options.title}
        </h2>
        <p id="mobile-confirm-message" className="text-center text-sm leading-5 text-gray-500">
          {options.message}
        </p>
        <div className="mt-3 flex w-full gap-2.5">
          <button
            type="button"
            onClick={() => dismiss("cancel")}
            className="h-[46px] flex-1 rounded-lg border border-gray-200 bg-white text-sm font-extrabold text-gray-800"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => dismiss("confirm")}
            className={`h-[46px] flex-1 rounded-lg border-0 text-sm font-extrabold text-white ${
              destructive ? "bg-red-600" : "bg-[#0a255d]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
