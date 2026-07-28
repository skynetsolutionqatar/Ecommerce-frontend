"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { wishlistApi } from "@/lib/api/wishlist.api";
import {
  clearGuestWishlist,
  loadGuestWishlist,
  saveGuestWishlist,
} from "@/lib/store/guest-wishlist";
import {
  apiProductToWishlistItem,
  wishlistDocumentToItems,
} from "@/lib/store/wishlist-helpers";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";
import type { WishlistItem } from "@/lib/types";

function applyGuestState(
  setItems: (items: WishlistItem[]) => void,
  setIds: (ids: Set<string>) => void
) {
  const guest = loadGuestWishlist();
  setItems(guest.items);
  setIds(new Set(guest.productIds));
}

export function useWishlist() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isLoggedIn = useAuthStore(selectIsAuthenticated);

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);

  const mergedRef = useRef(false);
  const syncingRef = useRef(false);

  const applyServerWishlist = useCallback((nextItems: WishlistItem[]) => {
    setItems(nextItems);
    setWishlistedIds(new Set(nextItems.map((item) => item.id)));
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlistedIds.has(productId),
    [wishlistedIds]
  );

  const persistGuest = useCallback((nextItems: WishlistItem[], nextIds: Set<string>) => {
    saveGuestWishlist(Array.from(nextIds), nextItems);
  }, []);

  const fetchServerWishlist = useCallback(async () => {
    const res = await wishlistApi.getAll();
    applyServerWishlist(wishlistDocumentToItems(res.data.wishlist));
  }, [applyServerWishlist]);

  // Guest: load from localStorage
  useEffect(() => {
    if (!isHydrated || isLoggedIn) return;
    mergedRef.current = false;
    applyGuestState(setItems, setWishlistedIds);
  }, [isHydrated, isLoggedIn]);

  // Logged in: merge guest IDs then fetch full wishlist
  useEffect(() => {
    if (!isHydrated || !isLoggedIn || mergedRef.current || syncingRef.current) return;

    syncingRef.current = true;
    setIsSyncing(true);

    void (async () => {
      try {
        const guestIds = loadGuestWishlist().productIds;

        if (guestIds.length > 0) {
          const res = await wishlistApi.merge(guestIds);
          clearGuestWishlist();
          applyServerWishlist(wishlistDocumentToItems(res.data.wishlist));
        } else {
          await fetchServerWishlist();
        }

        mergedRef.current = true;
      } catch {
        applyGuestState(setItems, setWishlistedIds);
      } finally {
        syncingRef.current = false;
        setIsSyncing(false);
      }
    })();
  }, [isHydrated, isLoggedIn, applyServerWishlist, fetchServerWishlist]);

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
        persistGuest(nextItems, nextIds);
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
      } catch {
        setWishlistedIds(previousIds);
        setItems(previousItems);
      }
    },
    [wishlistedIds, items, isLoggedIn, persistGuest]
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
