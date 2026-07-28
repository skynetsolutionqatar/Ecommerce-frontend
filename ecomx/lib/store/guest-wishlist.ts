import { STORAGE_KEYS } from "@/lib/Constant";
import type { WishlistItem } from "@/lib/types";

interface GuestWishlistData {
  productIds: string[];
  items: WishlistItem[];
}

const EMPTY: GuestWishlistData = { productIds: [], items: [] };

function readStorage(): GuestWishlistData {
  if (typeof window === "undefined") return EMPTY;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GUEST_WISHLIST);
    if (!raw) return EMPTY;

    const parsed = JSON.parse(raw) as GuestWishlistData;
    const productIds = Array.isArray(parsed.productIds) ? parsed.productIds.map(String) : [];
    const items = Array.isArray(parsed.items) ? parsed.items : [];

    return { productIds, items };
  } catch {
    return EMPTY;
  }
}

function writeStorage(data: GuestWishlistData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.GUEST_WISHLIST, JSON.stringify(data));
}

export function loadGuestWishlist(): GuestWishlistData {
  return readStorage();
}

export function saveGuestWishlist(productIds: string[], items: WishlistItem[]) {
  writeStorage({ productIds, items });
}

export function clearGuestWishlist() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.GUEST_WISHLIST);
}

export function getGuestWishlistIds(): string[] {
  return readStorage().productIds;
}
