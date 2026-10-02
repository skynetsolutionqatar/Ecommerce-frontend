"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchGuestActivitySummary,
  fetchGuestTimeline,
  fetchGuestVisitors,
} from "@/lib/api/guest-activity.api";

export const GUEST_ACTIVITY_SUMMARY_KEY = "guest-activity-summary";
export const GUEST_VISITORS_KEY = "guest-visitors";
export const GUEST_TIMELINE_KEY = "guest-timeline";

export function useGuestActivitySummary(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [GUEST_ACTIVITY_SUMMARY_KEY, params],
    queryFn: () => fetchGuestActivitySummary(params),
    staleTime: 30_000,
    meta: { toastOnError: true },
  });
}

export function useGuestVisitors(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [GUEST_VISITORS_KEY, params],
    queryFn: () => fetchGuestVisitors(params),
    staleTime: 20_000,
    placeholderData: (prev) => prev,
    meta: { toastOnError: true },
  });
}

export function useGuestTimeline(guestId: string | null, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [GUEST_TIMELINE_KEY, guestId, params],
    queryFn: () => fetchGuestTimeline(guestId!, params),
    enabled: !!guestId,
    staleTime: 15_000,
    meta: { toastOnError: true },
  });
}
