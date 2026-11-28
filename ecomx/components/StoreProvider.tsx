"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { trackGuestActivityIfAnonymous } from "@/lib/store/guest-activity-helpers";
import { useRouter } from "next/navigation";
import { fetchProduct } from "@/lib/api/product.api";
import { showError } from "@/lib/toast";
import { confirmRemoval } from "@/lib/store/confirm-dialog";
import { clearCheckoutAddress } from "@/lib/store/checkout-address-cache";
import { isPhoneViewport } from "@/lib/store/mobile-chrome";
import { authUserToStoreUser } from "@/lib/auth-utils";
import { apiProductToStoreProduct } from "@/lib/store/product-mapper";
import { ROUTES, shopUrl } from "@/lib/routes";
import { useAuthStore, selectIsAuthenticated } from "@/store/auth.store";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import type { CartItem, Product, StoreUser, WishlistItem } from "@/lib/types";

interface StoreContextValue {
  cart: CartItem[];
  wishlist: WishlistItem[];
  cartOpen: boolean;
  wishlistOpen: boolean;
  searchOpen: boolean;
  loginOpen: boolean;
  user: StoreUser | null;
  isWishlisted: (productId: string) => boolean;
  setCartOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setLoginOpen: (open: boolean) => void;
  logout: () => void;
  openProduct: (product: Product) => void;
  goToShop: (categoryId?: string) => void;
  addToCart: (product: Product, color: string, size: string, qty?: number) => void;
  buyNow: (product: Product, color: string, size: string, qty?: number) => Promise<boolean>;
  updateCart: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  refreshCart: () => Promise<void>;
  toggleWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  addWishlistToCart: (item: WishlistItem) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export default function StoreProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const { cart, addToCart, buyNow, updateCart, removeFromCart, refreshCart } = useCart();

  const {
    wishlist,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    moveToCart,
  } = useWishlist();

  const authUser = useAuthStore((s) => s.user);
  const isAuthHydrated = useAuthStore((s) => s.isHydrated);

  const user = useMemo<StoreUser | null>(() => {
    if (!isAuthHydrated || !authUser) return null;
    return authUserToStoreUser(authUser);
  }, [authUser, isAuthHydrated]);

  const logout = useCallback(() => {
    useAuthStore.getState().clearAuth();
    clearCheckoutAddress();
  }, []);

  useEffect(() => {
    if (!cartOpen) return;
    trackGuestActivityIfAnonymous({ eventType: "cart_viewed" }, cart);
  }, [cartOpen, cart]);

  const openProduct = useCallback(
    (product: Product) => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      router.push(ROUTES.product(product.slug ?? String(product.id)));
    },
    [router]
  );

  const goToShop = useCallback(
    (categoryId?: string) => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      router.push(shopUrl(categoryId ? { categoryId } : undefined));
    },
    [router]
  );

  const handleAddToCart = useCallback(
    (product: Product, color: string, size: string, qty = 1) => {
      if (product.quoteOnly) {
        router.push(ROUTES.product(product.slug));
        return;
      }
      void (async () => {
        const ok = await addToCart(product, color, size, qty);
        if (ok) setCartOpen(true);
      })();
    },
    [addToCart, router]
  );

  const handleBuyNow = useCallback(
    async (product: Product, color: string, size: string, qty = 1) => {
      if (product.quoteOnly) {
        router.push(ROUTES.product(product.slug));
        return false;
      }
      const ok = await buyNow(product, color, size, qty);
      if (!ok) return false;

      setCartOpen(false);
      router.push(ROUTES.checkout);
      return true;
    },
    [buyNow, router]
  );

  const handleUpdateCart = useCallback(
    (id: string, qty: number) => {
      void updateCart(id, qty);
    },
    [updateCart]
  );

  const handleRemoveFromCart = useCallback(
    (id: string) => {
      const run = () => {
        void removeFromCart(id);
      };
      if (!isPhoneViewport()) {
        run();
        return;
      }
      const label = cart.find((entry) => entry.id === id)?.name?.trim() || "this item";
      confirmRemoval({
        title: "Remove from cart?",
        message: `"${label}" will be removed from your cart. You can add it again anytime from the shop.`,
        cancelLabel: "Keep in cart",
        confirmLabel: "Remove",
        onConfirm: run,
      });
    },
    [cart, removeFromCart]
  );

  const handleToggleWishlist = useCallback(
    (item: WishlistItem) => {
      if (!isWishlisted(item.id) || !isPhoneViewport()) {
        void toggleWishlist(item);
        return;
      }
      const label = item.name.trim() || "This item";
      confirmRemoval({
        title: "Remove from wishlist?",
        message: `"${label}" will be removed from your saved items.`,
        cancelLabel: "Keep saved",
        confirmLabel: "Remove",
        onConfirm: () => {
          void toggleWishlist(item);
        },
      });
    },
    [isWishlisted, toggleWishlist]
  );

  const handleRemoveFromWishlist = useCallback(
    (productId: string) => {
      const run = () => {
        void removeFromWishlist(productId);
      };
      if (!isPhoneViewport()) {
        run();
        return;
      }
      const label = wishlist.find((entry) => entry.id === productId)?.name?.trim() || "This item";
      confirmRemoval({
        title: "Remove from wishlist?",
        message: `"${label}" will be removed from your saved items.`,
        cancelLabel: "Keep saved",
        confirmLabel: "Remove",
        onConfirm: run,
      });
    },
    [removeFromWishlist, wishlist]
  );

  const addWishlistToCart = useCallback(
    async (item: WishlistItem) => {
      try {
        const loggedIn = selectIsAuthenticated(useAuthStore.getState());

        // Quote-only products can't go in the cart — send the user to the product page.
        const apiForCheck = await fetchProduct(item.id);
        if (apiForCheck.quoteOnly) {
          setWishlistOpen(false);
          router.push(ROUTES.product(apiForCheck.slug));
          return;
        }

        if (loggedIn) {
          const apiProduct = await moveToCart(item.id);
          if (!apiProduct) {
            throw new Error("Move to cart failed");
          }
          await refreshCart();
        } else {
          const apiProduct = await fetchProduct(item.id);
          const product = apiProductToStoreProduct(apiProduct);
          const ok = await addToCart(
            product,
            product.colors[0]?.name ?? "Default",
            product.sizes?.[0] ?? ""
          );
          if (!ok) return;

          if (isWishlisted(item.id)) {
            await removeFromWishlist(item.id);
          }
        }

        setWishlistOpen(false);
        setCartOpen(true);
      } catch (err) {
        showError(err, "Could not move item to cart");
      }
    },
    [addToCart, isWishlisted, moveToCart, refreshCart, removeFromWishlist, router]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      cart,
      wishlist,
      cartOpen,
      wishlistOpen,
      searchOpen,
      loginOpen,
      user,
      isWishlisted,
      setCartOpen,
      setWishlistOpen,
      setSearchOpen,
      setLoginOpen,
      logout,
      openProduct,
      goToShop,
      addToCart: handleAddToCart,
      buyNow: handleBuyNow,
      updateCart: handleUpdateCart,
      removeFromCart: handleRemoveFromCart,
      refreshCart,
      toggleWishlist: handleToggleWishlist,
      removeFromWishlist: handleRemoveFromWishlist,
      addWishlistToCart,
    }),
    [
      cart,
      wishlist,
      cartOpen,
      wishlistOpen,
      searchOpen,
      loginOpen,
      user,
      isWishlisted,
      logout,
      openProduct,
      goToShop,
      handleAddToCart,
      handleBuyNow,
      handleUpdateCart,
      handleRemoveFromCart,
      refreshCart,
      handleToggleWishlist,
      handleRemoveFromWishlist,
      addWishlistToCart,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
