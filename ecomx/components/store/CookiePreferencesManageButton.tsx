"use client";

import { openCookiePreferences } from "@/lib/store/cookie-consent";

export default function CookiePreferencesManageButton() {
  return (
    <button
      type="button"
      onClick={() => openCookiePreferences()}
      className="mt-6 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-extrabold text-[#0a255d] sm:w-auto"
    >
      Manage cookie preferences
    </button>
  );
}