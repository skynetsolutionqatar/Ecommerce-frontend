import { wishlistApi } from "@/lib/api/wishlist.api";
import {
  clearGuestWishlist,
  loadGuestWishlist,
} from "@/lib/store/guest-wishlist";
import { wishlistDocumentToItems } from "@/lib/store/wishlist-helpers";
import type { WishlistItem } from "@/lib/types";

export function loadGuestWishlistItems(): {
  items: WishlistItem[];
  productIds: string[];
} {
  const guest = loadGuestWishlist();
  return { items: guest.items, productIds: guest.productIds };
}

/** Merge guest wishlist ids into the server wishlist after login. */
export async function mergeGuestWishlistToServer(): Promise<WishlistItem[]> {
  const guestIds = loadGuestWishlist().productIds;

  if (guestIds.length === 0) {
    const res = await wishlistApi.getAll();
    return wishlistDocumentToItems(res.data.wishlist);
  }

  const res = await wishlistApi.merge(guestIds);
  clearGuestWishlist();
  return wishlistDocumentToItems(res.data.wishlist);
}
