"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cartApi } from "@/lib/api/cart.api";
import { clearGuestCart, loadGuestCart, saveGuestCart } from "@/lib/store/guest-cart";
import {
  apiCartToCartItems,
  isQtyAllowed,
  mergeGuestCartItem,
  productToGuestCartItem,
} from "@/lib/store/cart-helpers";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";
import type { CartItem, Product } from "@/lib/types";

export function useCart() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isLoggedIn = useAuthStore(selectIsAuthenticated);

  const [items, setItems] = useState<CartItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const mergedRef = useRef(false);
  const syncingRef = useRef(false);
  const itemsRef = useRef<CartItem[]>(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const applyServerCart = useCallback((cartItems: CartItem[]) => {
    setItems(cartItems);
  }, []);

  const persistGuest = useCallback((nextItems: CartItem[]) => {
    saveGuestCart(nextItems);
  }, []);

  const fetchServerCart = useCallback(async () => {
    const res = await cartApi.get();
    applyServerCart(apiCartToCartItems(res.data.cart));
  }, [applyServerCart]);

  // Guest: load from localStorage
  useEffect(() => {
    if (!isHydrated || isLoggedIn) return;
    mergedRef.current = false;
    setItems(loadGuestCart());
  }, [isHydrated, isLoggedIn]);

  // Logged in: merge guest cart then fetch server cart
  useEffect(() => {
    if (!isHydrated || !isLoggedIn || mergedRef.current || syncingRef.current) return;

    syncingRef.current = true;
    setIsSyncing(true);

    void (async () => {
      try {
        const guestItems = loadGuestCart();

        if (guestItems.length > 0) {
          for (const item of guestItems) {
            const qty =
              item.stock != null ? Math.min(item.qty, Math.max(item.stock, 0)) : item.qty;
            if (qty > 0) {
              await cartApi.add({ productId: item.productId, quantity: qty });
            }
          }
          clearGuestCart();
        }

        await fetchServerCart();
        mergedRef.current = true;
      } catch {
        setItems(loadGuestCart());
      } finally {
        syncingRef.current = false;
        setIsSyncing(false);
      }
    })();
  }, [isHydrated, isLoggedIn, fetchServerCart]);

  const addToCart = useCallback(
    async (product: Product, color?: string, size?: string, quantity = 1) => {
      const qtyToAdd = Math.max(1, quantity);
      const currentItems = itemsRef.current;
      const existing = currentItems.find((item) => item.productId === product.id);
      const stock = product.stock ?? existing?.stock;

      if (stock != null && stock <= 0) {
        return false;
      }

      if (stock != null && (existing?.qty ?? 0) + qtyToAdd > stock) {
        return false;
      }

      const nextItem = productToGuestCartItem(product, color, size, qtyToAdd);
      const previousItems = currentItems;
      const optimisticItems = mergeGuestCartItem(previousItems, nextItem);

      if (optimisticItems === previousItems) {
        return false;
      }

      setItems(optimisticItems);

      if (!isLoggedIn) {
        persistGuest(optimisticItems);
        return true;
      }

      try {
        await cartApi.add({ productId: product.id, quantity: qtyToAdd });
        await fetchServerCart();
        return true;
      } catch {
        setItems(previousItems);
        return false;
      }
    },
    [isLoggedIn, persistGuest, fetchServerCart]
  );

  const removeFromCart = useCallback(
    async (id: string) => {
      const previousItems = items;
      const optimisticItems = previousItems.filter((item) => item.id !== id);
      setItems(optimisticItems);

      if (!isLoggedIn) {
        persistGuest(optimisticItems);
        return true;
      }

      try {
        await cartApi.removeItem(id);
        await fetchServerCart();
        return true;
      } catch {
        setItems(previousItems);
        return false;
      }
    },
    [items, isLoggedIn, persistGuest, fetchServerCart]
  );

  const updateCart = useCallback(
    async (id: string, qty: number) => {
      if (qty < 1) {
        return removeFromCart(id);
      }

      const previousItems = items;
      const item = previousItems.find((entry) => entry.id === id);
      if (!item) return false;

      if (!isQtyAllowed(qty, item.stock)) {
        return false;
      }

      const optimisticItems = previousItems.map((entry) =>
        entry.id === id ? { ...entry, qty } : entry
      );
      setItems(optimisticItems);

      if (!isLoggedIn) {
        persistGuest(optimisticItems);
        return true;
      }

      try {
        await cartApi.updateItem(id, { quantity: qty });
        await fetchServerCart();
        return true;
      } catch {
        setItems(previousItems);
        return false;
      }
    },
    [items, isLoggedIn, persistGuest, fetchServerCart, removeFromCart]
  );

  const clearCart = useCallback(async () => {
    const previousItems = items;
    setItems([]);

    if (!isLoggedIn) {
      clearGuestCart();
      return true;
    }

    try {
      await cartApi.clear();
      setItems([]);
      return true;
    } catch {
      setItems(previousItems);
      return false;
    }
  }, [items, isLoggedIn]);

  const buyNow = useCallback(
    async (product: Product, color?: string, size?: string, quantity = 1) => {
      const requestedQty = Math.max(1, quantity);
      const currentItems = itemsRef.current;
      const existing = currentItems.find((item) => item.productId === product.id);
      const stock = product.stock ?? existing?.stock;
      const inCartQty = existing?.qty ?? 0;

      if (stock != null && stock <= 0) {
        return false;
      }

      if (stock != null && inCartQty >= stock) {
        return inCartQty > 0;
      }

      const qtyToAdd =
        stock != null
          ? Math.min(requestedQty, Math.max(stock - inCartQty, 0))
          : requestedQty;

      if (qtyToAdd <= 0) {
        return inCartQty > 0;
      }

      const added = await addToCart(product, color, size, qtyToAdd);
      if (added) {
        return true;
      }

      return itemsRef.current.some((item) => item.productId === product.id);
    },
    [addToCart]
  );

  return {
    cart: items,
    addToCart,
    buyNow,
    updateCart,
    removeFromCart,
    clearCart,
    refreshCart: fetchServerCart,
    isSyncing,
  };
}
