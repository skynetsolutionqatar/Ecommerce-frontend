import { recordGuestEvents } from "@/lib/api/guest-activity.api";
import { getOrCreateGuestId, getOrCreateGuestSessionId } from "@/lib/store/guest-id";
import type { GuestActivityEventPayload, GuestEventType } from "@/types/guest-activity.types";
import type { CartItem } from "@/lib/types";

const FLUSH_MS = 4000;
const MAX_QUEUE = 40;
const VIEW_DEBOUNCE_MS = 8000;

type QueueItem = GuestActivityEventPayload;

let queue: QueueItem[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let isFlushing = false;
const lastProductViewAt = new Map<string, number>();

export function cartSnapshotMeta(cart: CartItem[], wishlistCount: number) {
  const cartItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartValue = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  return {
    cartItems,
    wishlistItems: wishlistCount,
    cartValue: Math.round(cartValue * 100) / 100,
  };
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushGuestActivityQueue();
  }, FLUSH_MS);
}

export function trackGuestEvent(event: GuestActivityEventPayload) {
  if (typeof window === "undefined") return;

  if (event.eventType === "product_view" && event.productId) {
    const now = Date.now();
    const last = lastProductViewAt.get(event.productId) ?? 0;
    if (now - last < VIEW_DEBOUNCE_MS) return;
    lastProductViewAt.set(event.productId, now);
  }

  queue.push(event);
  if (queue.length >= MAX_QUEUE) {
    void flushGuestActivityQueue();
    return;
  }
  scheduleFlush();
}

export async function flushGuestActivityQueue() {
  if (isFlushing || queue.length === 0 || typeof window === "undefined") return;

  const guestId = getOrCreateGuestId();
  if (!guestId) return;

  isFlushing = true;
  const batch = queue.splice(0, MAX_QUEUE);

  try {
    await recordGuestEvents({
      guestId,
      sessionId: getOrCreateGuestSessionId(),
      events: batch,
    });
  } catch {
    queue = [...batch, ...queue].slice(0, MAX_QUEUE);
  } finally {
    isFlushing = false;
    if (queue.length > 0) scheduleFlush();
  }
}

export function trackGuestEventTyped(
  eventType: GuestEventType,
  partial: Omit<GuestActivityEventPayload, "eventType"> = {}
) {
  trackGuestEvent({ eventType, ...partial });
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    if (queue.length === 0) return;
    const guestId = getOrCreateGuestId();
    if (!guestId) return;

    const body = JSON.stringify({
      guestId,
      sessionId: getOrCreateGuestSessionId(),
      events: queue.splice(0, MAX_QUEUE),
    });

    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050/api/v1";
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
    try {
      fetch(`${base}/guest-activity/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(tenantId ? { "x-tenant-id": tenantId } : {}),
        },
        body,
        keepalive: true,
      });
    } catch {
      // ignore
    }
  });
}
