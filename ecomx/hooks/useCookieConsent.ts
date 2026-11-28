"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  acceptAllCookies,
  getCookieConsentServerSnapshot,
  getCookieConsentSnapshot,
  isCookieConsentAnswered,
  rejectOptionalCookies,
  saveCustomCookiePreferences,
  shouldShowCookieConsentBanner,
  subscribeCookieConsent,
  type CookieConsentPreferences,
  type CookieConsentRecord,
  type CookieConsentSnapshot,
} from "@/lib/store/cookie-consent";

function toRecord(snapshot: CookieConsentSnapshot): CookieConsentRecord | null {
  if (snapshot === "pending" || snapshot === null) return null;
  return snapshot;
}

export function useCookieConsentState() {
  const snapshot = useSyncExternalStore(
    subscribeCookieConsent,
    getCookieConsentSnapshot,
    getCookieConsentServerSnapshot
  );

  return {
    record: toRecord(snapshot),
    answered: isCookieConsentAnswered(snapshot),
    pending: snapshot === "pending",
  };
}

export function useCookieConsentActions() {
  const acceptAll = useCallback(() => acceptAllCookies(), []);
  const rejectAll = useCallback(() => rejectOptionalCookies(), []);
  const saveCustom = useCallback(
    (preferences: CookieConsentPreferences) => saveCustomCookiePreferences(preferences),
    []
  );
  return { acceptAll, rejectAll, saveCustom };
}

/** True when storage is loaded and the user has not answered yet. */
export function useShowCookieBanner() {
  const snapshot = useSyncExternalStore(
    subscribeCookieConsent,
    getCookieConsentSnapshot,
    getCookieConsentServerSnapshot
  );
  return shouldShowCookieConsentBanner(snapshot);
}