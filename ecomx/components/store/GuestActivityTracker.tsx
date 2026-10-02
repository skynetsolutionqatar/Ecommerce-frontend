"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getOrCreateGuestId } from "@/lib/store/guest-id";
import {
  flushGuestActivityQueue,
  trackGuestEventTyped,
} from "@/lib/store/guest-activity-tracker";

/** Mount once under the storefront shell — store visit telemetry. */
export default function GuestActivityTracker() {
  const pathname = usePathname();
  const visitTracked = useRef(false);

  useEffect(() => {
    getOrCreateGuestId();
  }, []);

  useEffect(() => {
    if (visitTracked.current) return;
    visitTracked.current = true;
    trackGuestEventTyped("store_visit", { metadata: { source: pathname || "/" } });
  }, [pathname]);

  useEffect(() => {
    return () => {
      void flushGuestActivityQueue();
    };
  }, []);

  return null;
}
