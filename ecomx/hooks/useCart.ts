"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cartApi } from "@/lib/api/cart.api";
import { showError } from "@/lib/toast";
import {
  apiCartToCartItems,
  isQtyAllowed,
  mergeGuestCartItem,
  productToGuestCartItem,
} from "@/lib/store/cart-helpers";
import {
  loadGuestCartItems,
  mergeGuestCartToServer,
} from "@/lib/store/cart-sync";
import { clearGuestCart, saveGuestCart } from "@/lib/store/guest-cart";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";
import type { CartItem, Product } from "@/lib/types";
import { trackGuestActivityIfAnonymous } from "@/lib/store/guest-activity-helpers";

export function useCart() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isLoggedIn = useAuthStore(selectIsAuthenticated);

  const [items, setItems] = useState<CartItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasMergedGuestCart = useRef(false);
  const isSyncingRef = useRef(false);
  const itemsRef = useRef<CartItem[]>(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const applyServerCart = useCallback(async () => {
    const res = await cartApi.get();
    setItems(apiCartToCartItems(res.data.cart));
  }, []);

  // Guest users: read cart from local storage.
  useEffect(() => {
    if (!isHydrated || isLoggedIn) return;
    hasMergedGuestCart.current = false;
    setItems(loadGuestCartItems());
  }, [isHydrated, isLoggedIn]);

  // Logged-in users: merge guest cart once, then load server cart.
  useEffect(() => {
    if (!isHydrated || !isLoggedIn || hasMergedGuestCart.current || isSyncingRef.current) return;

    isSyncingRef.current = true;
    setIsSyncing(true);

    void (async () => {
      try {
        await mergeGuestCartToServer();
        await applyServerCart();
        hasMergedGuestCart.current = true;
      } catch (error) {
        setItems(loadGuestCartItems());
        showError(error, "Could not sync your cart");
      } finally {
        isSyncingRef.current = false;
        setIsSyncing(false);
      }
    })();
  }, [isHydrated, isLoggedIn, applyServerCart]);

  const persistGuestCart = useCallback((nextItems: CartItem[]) => {
    saveGuestCart(nextItems);
  }, []);

  const addToCart = useCallback(
    async (product: Product, color?: string, size?: string, quantity = 1) => {
      const qtyToAdd = Math.max(1, quantity);
      const currentItems = itemsRef.current;
      const existing = currentItems.find((item) => item.productId === product.id);
      const stock = product.stock ?? existing?.stock;

      if (stock != null && stock <= 0) {
        showError("This item is out of stock");
        return false;
      }

      if (stock != null && (existing?.qty ?? 0) + qtyToAdd > stock) {
        showError("Not enough stock available");
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
        persistGuestCart(optimisticItems);
        trackGuestActivityIfAnonymous(
          {
            eventType: "add_to_cart",
            productId: product.id,
            quantity: qtyToAdd,
            metadata: { productName: product.name },
          },
          optimisticItems
        );
        return true;
      }

      try {
        await cartApi.add({ productId: product.id, quantity: qtyToAdd });
        await applyServerCart();
        return true;
      } catch (error) {
        setItems(previousItems);
        showError(error, "Could not add item to cart");
        return false;
      }
    },
    [isLoggedIn, persistGuestCart, applyServerCart]
  );

  const removeFromCart = useCallback(
    async (id: string) => {
      const previousItems = items;
      const optimisticItems = previousItems.filter((item) => item.id !== id);
      setItems(optimisticItems);

      if (!isLoggedIn) {
        persistGuestCart(optimisticItems);
        const removed = previousItems.find((item) => item.id === id);
        trackGuestActivityIfAnonymous(
          {
            eventType: "remove_from_cart",
            productId: removed?.productId,
            metadata: { productName: removed?.name },
          },
          optimisticItems
        );
        return true;
      }

      try {
        await cartApi.removeItem(id);
        await applyServerCart();
        return true;
      } catch (error) {
        setItems(previousItems);
        showError(error, "Could not remove item from cart");
        return false;
      }
    },
    [items, isLoggedIn, persistGuestCart, applyServerCart]
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
        persistGuestCart(optimisticItems);
        return true;
      }

      try {
        await cartApi.updateItem(id, { quantity: qty });
        await applyServerCart();
        return true;
      } catch (error) {
        setItems(previousItems);
        showError(error, "Could not update cart quantity");
        return false;
      }
    },
    [items, isLoggedIn, persistGuestCart, applyServerCart, removeFromCart]
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
    } catch (error) {
      setItems(previousItems);
      showError(error, "Could not clear cart");
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
    refreshCart: applyServerCart,
    isSyncing,
  };
}
