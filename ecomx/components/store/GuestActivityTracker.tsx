"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCookieConsentState } from "@/hooks/useCookieConsent";
import { getOrCreateGuestId } from "@/lib/store/guest-id";
import {
  flushGuestActivityQueue,
  trackGuestEventTyped,
} from "@/lib/store/guest-activity-tracker";

/** Mount once under the storefront shell — store visit telemetry. */
export default function GuestActivityTracker() {
  const pathname = usePathname();
  const visitTracked = useRef(false);
  const { record } = useCookieConsentState();
  const performanceAllowed = record?.preferences.performance === true;

  useEffect(() => {
    if (!performanceAllowed) return;
    getOrCreateGuestId();
  }, [performanceAllowed]);

  useEffect(() => {
    if (!performanceAllowed) {
      visitTracked.current = false;
      return;
    }
    if (visitTracked.current) return;
    visitTracked.current = true;
    trackGuestEventTyped("store_visit", { metadata: { source: pathname || "/" } });
  }, [pathname, performanceAllowed]);

  useEffect(() => {
    return () => {
      void flushGuestActivityQueue();
    };
  }, []);

  return null;
}
