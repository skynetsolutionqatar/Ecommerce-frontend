"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { wishlistApi } from "@/lib/api/wishlist.api";
import { showError } from "@/lib/toast";
import { wishlistDocumentToItems } from "@/lib/store/wishlist-helpers";
import {
  loadGuestWishlistItems,
  mergeGuestWishlistToServer,
} from "@/lib/store/wishlist-sync";
import { saveGuestWishlist } from "@/lib/store/guest-wishlist";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";
import type { WishlistItem } from "@/lib/types";
import { trackGuestActivityIfAnonymous } from "@/lib/store/guest-activity-helpers";
import { loadGuestCartItems } from "@/lib/store/cart-sync";

export function useWishlist() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isLoggedIn = useAuthStore(selectIsAuthenticated);

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const hasMergedGuestWishlist = useRef(false);
  const isSyncingRef = useRef(false);

  const applyServerWishlist = useCallback((nextItems: WishlistItem[]) => {
    setItems(nextItems);
    setWishlistedIds(new Set(nextItems.map((item) => item.id)));
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlistedIds.has(productId),
    [wishlistedIds]
  );

  const persistGuestWishlist = useCallback((nextItems: WishlistItem[], nextIds: Set<string>) => {
    saveGuestWishlist(Array.from(nextIds), nextItems);
  }, []);

  const fetchServerWishlist = useCallback(async () => {
    const res = await wishlistApi.getAll();
    applyServerWishlist(wishlistDocumentToItems(res.data.wishlist));
  }, [applyServerWishlist]);

  // Guest users: read wishlist from local storage.
  useEffect(() => {
    if (!isHydrated || isLoggedIn) return;
    hasMergedGuestWishlist.current = false;

    const guest = loadGuestWishlistItems();
    setItems(guest.items);
    setWishlistedIds(new Set(guest.productIds));
  }, [isHydrated, isLoggedIn]);

  // Logged-in users: merge guest wishlist once, then load server wishlist.
  useEffect(() => {
    if (!isHydrated || !isLoggedIn || hasMergedGuestWishlist.current || isSyncingRef.current) return;

    isSyncingRef.current = true;
    setIsSyncing(true);

    void (async () => {
      try {
        const mergedItems = await mergeGuestWishlistToServer();
        applyServerWishlist(mergedItems);
        hasMergedGuestWishlist.current = true;
      } catch (error) {
        const guest = loadGuestWishlistItems();
        setItems(guest.items);
        setWishlistedIds(new Set(guest.productIds));
        showError(error, "Could not sync your wishlist");
      } finally {
        isSyncingRef.current = false;
        setIsSyncing(false);
      }
    })();
  }, [isHydrated, isLoggedIn, applyServerWishlist]);

  const toggleWishlist = useCallback(
    async (item: WishlistItem) => {
      const productId = item.id;
      const previousIds = wishlistedIds;
      const previousItems = items;
      const wasWishlisted = previousIds.has(productId);

      const nextIds = new Set(previousIds);
      const nextItems = wasWishlisted
        ? previousItems.filter((entry) => entry.id !== productId)
        : [...previousItems.filter((entry) => entry.id !== productId), item];

      if (wasWishlisted) nextIds.delete(productId);
      else nextIds.add(productId);

      setWishlistedIds(nextIds);
      setItems(nextItems);

      if (!isLoggedIn) {
        persistGuestWishlist(nextItems, nextIds);
        trackGuestActivityIfAnonymous(
          {
            eventType: wasWishlisted ? "remove_from_wishlist" : "add_to_wishlist",
            productId,
            metadata: { productName: item.name },
          },
          loadGuestCartItems()
        );
        return;
      }

      try {
        const res = await wishlistApi.toggle(productId);
        const serverWishlisted = res.data.wishlisted;

        if (serverWishlisted !== !wasWishlisted) {
          if (serverWishlisted) {
            setWishlistedIds((prev) => new Set(prev).add(productId));
            setItems((prev) =>
              prev.some((entry) => entry.id === productId) ? prev : [...prev, item]
            );
          } else {
            setWishlistedIds((prev) => {
              const updated = new Set(prev);
              updated.delete(productId);
              return updated;
            });
            setItems((prev) => prev.filter((entry) => entry.id !== productId));
          }
        }
      } catch (error) {
        setWishlistedIds(previousIds);
        setItems(previousItems);
        showError(error, "Could not update wishlist");
      }
    },
    [wishlistedIds, items, isLoggedIn, persistGuestWishlist]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      const item = items.find((entry) => entry.id === productId);
      if (!item || !isWishlisted(productId)) return;
      await toggleWishlist(item);
    },
    [items, isWishlisted, toggleWishlist]
  );

  const moveToCart = useCallback(
    async (productId: string) => {
      if (!isLoggedIn) return null;

      const res = await wishlistApi.moveToCart(productId);
      setItems((prev) => prev.filter((entry) => entry.id !== productId));
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      return res.data.product;
    },
    [isLoggedIn]
  );

  return {
    wishlist: items,
    wishlistedIds,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    moveToCart,
    isSyncing,
    refreshWishlist: fetchServerWishlist,
  };
}
