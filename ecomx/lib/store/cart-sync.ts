import { cartApi } from "@/lib/api/cart.api";
import { clearGuestCart, loadGuestCart } from "@/lib/store/guest-cart";
import type { CartItem } from "@/lib/types";

/** Upload guest cart items to the server after login, then clear local storage. */
export async function mergeGuestCartToServer(): Promise<void> {
  const guestItems = loadGuestCart();

  for (const item of guestItems) {
    const qty =
      item.stock != null ? Math.min(item.qty, Math.max(item.stock, 0)) : item.qty;

    if (qty > 0) {
      await cartApi.add({ productId: item.productId, quantity: qty });
    }
  }

  if (guestItems.length > 0) {
    clearGuestCart();
  }
}

export function loadGuestCartItems(): CartItem[] {
  return loadGuestCart();
}
