"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import type { CookieConsentPreferences } from "@/lib/store/cookie-consent";

function CheckboxRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <label
      className={`flex gap-3 border-b border-gray-100 py-3.5 last:border-b-0 ${disabled ? "opacity-80" : "cursor-pointer"}`}
    >
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 shrink-0 accent-[#0a255d] disabled:opacity-60"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span>
        <span className="block text-sm font-extrabold text-gray-900">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-gray-500">{description}</span>
      </span>
    </label>
  );
}

function CookiePreferencesDialog({
  initial,
  onClose,
  onSave,
  onLearnMore,
}: {
  initial: CookieConsentPreferences;
  onClose: () => void;
  onSave: (preferences: CookieConsentPreferences) => void;
  onLearnMore?: () => void;
}) {
  const [prefs, setPrefs] = useState(initial);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[480] flex items-center justify-center px-4 py-8">
      <button
        type="button"
        className="absolute inset-0 border-0 bg-black/45"
        aria-label="Close cookie preferences"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-prefs-title"
        className="relative flex max-h-[min(92dvh,640px)] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3.5 sm:px-5">
          <h2 id="cookie-prefs-title" className="text-base font-extrabold text-gray-900">
            Customize your cookie preferences
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-gray-100 text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2 sm:px-5">
          <p className="py-2 text-xs font-bold uppercase tracking-wide text-gray-400">Essential</p>
          <CheckboxRow
            label="Essential cookies"
            description="Required for sign-in, cart, checkout, and site security."
            checked
            disabled
          />

          <p className="pt-3 text-xs font-bold uppercase tracking-wide text-gray-400">Optional</p>
          <CheckboxRow
            label="Performance"
            description="Help us analyze site usage and improve performance."
            checked={prefs.performance}
            onChange={(value) => setPrefs((prev) => ({ ...prev, performance: value }))}
          />
          <CheckboxRow
            label="Functional"
            description="Enable enhanced functionality and personalization."
            checked={prefs.functional}
            onChange={(value) => setPrefs((prev) => ({ ...prev, functional: value }))}
          />
          <CheckboxRow
            label="Advertising"
            description="Allow personalized promotions and marketing content."
            checked={prefs.advertising}
            onChange={(value) => setPrefs((prev) => ({ ...prev, advertising: value }))}
          />
        </div>

        <footer className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3.5 sm:px-5 sm:pb-4">
          <p className="text-xs leading-5 text-gray-500">
            We use cookies to improve your experience on our website.{" "}
            <Link
              href={ROUTES.cookiePolicy}
              className="font-semibold text-[#0a255d] underline-offset-2 hover:underline"
              onClick={() => {
                onLearnMore?.();
                onClose();
              }}
            >
              Learn More
            </Link>
          </p>
          <button
            type="button"
            onClick={() => onSave(prefs)}
            className="h-11 w-full rounded-lg border-0 bg-[#0a255d] text-sm font-extrabold uppercase tracking-wide text-white"
          >
            Save preferences
          </button>
        </footer>
      </div>
    </div>
  );
}

export default function CookiePreferencesModal({
  open,
  initial,
  onClose,
  onSave,
  onLearnMore,
}: {
  open: boolean;
  initial: CookieConsentPreferences;
  onClose: () => void;
  onSave: (preferences: CookieConsentPreferences) => void;
  onLearnMore?: () => void;
}) {
  if (!open) return null;

  return (
    <CookiePreferencesDialog
      key={`${initial.performance}-${initial.functional}-${initial.advertising}`}
      initial={initial}
      onClose={onClose}
      onSave={onSave}
      onLearnMore={onLearnMore}
    />
  );
}