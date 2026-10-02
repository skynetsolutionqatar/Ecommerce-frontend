import { apiGet, apiPost } from "./client";
import type {
  GuestActivityEventPayload,
  GuestActivitySummary,
  GuestTimelineItem,
  GuestVisitorRow,
} from "@/types/guest-activity.types";
import type { PaginationMeta } from "@/types/api.types";

export async function recordGuestEvents(input: {
  guestId: string;
  sessionId?: string;
  events: GuestActivityEventPayload[];
}) {
  return apiPost<{ recorded: number }>("/guest-activity/events", input);
}

export async function saveGuestPhone(input: { guestId: string; phoneNumber: string }) {
  return apiPost<{ guestId: string; phoneNumber: string }>("/guest-activity/phone", input);
}

export async function linkGuestActivity(input: {
  guestId: string;
  linkType?: "login_linked" | "register_linked";
}) {
  return apiPost<{ guestId: string; customerId: string; linked: boolean }>(
    "/guest-activity/link",
    input
  );
}

export async function fetchGuestActivitySummary(params?: Record<string, unknown>) {
  const res = await apiGet<{ summary: GuestActivitySummary }>(
    "/guest-activity/admin/summary",
    params
  );
  return res.data.summary;
}

export async function fetchGuestVisitors(params?: Record<string, unknown>) {
  const res = await apiGet<{ visitors: GuestVisitorRow[] }>(
    "/guest-activity/admin/visitors",
    params
  );
  return { visitors: res.data.visitors, pagination: res.pagination as PaginationMeta | undefined };
}

export async function fetchGuestTimeline(
  guestId: string,
  params?: Record<string, unknown>
) {
  const res = await apiGet<{
    guestId: string;
    timeline: GuestTimelineItem[];
  }>(`/guest-activity/admin/visitors/${encodeURIComponent(guestId)}/timeline`, params);
  return {
    guestId: res.data.guestId,
    timeline: res.data.timeline,
    pagination: res.pagination as PaginationMeta | undefined,
  };
}
