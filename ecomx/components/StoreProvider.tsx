"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { fetchProduct } from "@/lib/api/product.api";
import { showError } from "@/lib/toast";
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
  }, []);

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
      void (async () => {
        const ok = await addToCart(product, color, size, qty);
        if (ok) setCartOpen(true);
      })();
    },
    [addToCart]
  );

  const handleBuyNow = useCallback(
    async (product: Product, color: string, size: string, qty = 1) => {
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
      void removeFromCart(id);
    },
    [removeFromCart]
  );

  const handleToggleWishlist = useCallback(
    (item: WishlistItem) => {
      void toggleWishlist(item);
    },
    [toggleWishlist]
  );

  const handleRemoveFromWishlist = useCallback(
    (productId: string) => {
      void removeFromWishlist(productId);
    },
    [removeFromWishlist]
  );

  const addWishlistToCart = useCallback(
    async (item: WishlistItem) => {
      try {
        const loggedIn = selectIsAuthenticated(useAuthStore.getState());

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
    [addToCart, isWishlisted, moveToCart, refreshCart, removeFromWishlist]
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
