import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";
import { loadGuestWishlist } from "@/lib/store/guest-wishlist";
import {
  cartSnapshotMeta,
  trackGuestEvent,
} from "@/lib/store/guest-activity-tracker";
import type { GuestActivityEventPayload } from "@/types/guest-activity.types";
import type { CartItem } from "@/lib/types";

export function isGuestVisitor(): boolean {
  const state = useAuthStore.getState();
  if (!state.isHydrated) return false;
  return !selectIsAuthenticated(state);
}

export function trackGuestActivityIfAnonymous(
  event: GuestActivityEventPayload,
  cart?: CartItem[]
) {
  if (!isGuestVisitor()) return;

  const wishlistCount = loadGuestWishlist().productIds.length;
  const meta = cart ? cartSnapshotMeta(cart, wishlistCount) : undefined;

  trackGuestEvent({
    ...event,
    metadata: {
      ...(meta ?? {}),
      ...(event.metadata ?? {}),
    },
  });
}
