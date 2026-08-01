import { STORAGE_KEYS } from "@/lib/Constant";
import type { CartItem } from "@/lib/types";

const EMPTY: CartItem[] = [];

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return EMPTY;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GUEST_CART);
    if (!raw) return EMPTY;

    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(items));
}

export function loadGuestCart(): CartItem[] {
  return readStorage();
}

export function saveGuestCart(items: CartItem[]) {
  writeStorage(items);
}

export function clearGuestCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.GUEST_CART);
}
