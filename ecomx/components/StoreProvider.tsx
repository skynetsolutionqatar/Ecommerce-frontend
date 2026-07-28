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
import { authUserToStoreUser } from "@/lib/auth-utils";
import { apiProductToStoreProduct } from "@/lib/store/product-mapper";
import { ROUTES, shopUrl } from "@/lib/routes";
import { useAuthStore, selectIsAuthenticated } from "@/store/auth.store";
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
  addToCart: (product: Product, color: string, size: string) => void;
  updateCart: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
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

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

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
      router.push(shopUrl(categoryId));
    },
    [router]
  );

  const addToCart = useCallback((product: Product, color: string, size: string) => {
    const id = `${product.id}-${color}-${size}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          id,
          productId: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          img: product.images[0],
          color,
          size,
          qty: 1,
        },
      ];
    });
    setCartOpen(true);
  }, []);

  const updateCart = useCallback((id: string, qty: number) => {
    if (qty < 1) setCart((prev) => prev.filter((i) => i.id !== id));
    else setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

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
        let product;

        if (loggedIn) {
          const apiProduct = await moveToCart(item.id);
          if (!apiProduct) {
            throw new Error("Move to cart failed");
          }
          product = apiProductToStoreProduct(apiProduct);
        } else {
          const apiProduct = await fetchProduct(item.id);
          product = apiProductToStoreProduct(apiProduct);
          if (isWishlisted(item.id)) {
            await removeFromWishlist(item.id);
          }
        }

        addToCart(product, product.colors[0]?.name ?? "Default", product.sizes?.[0] ?? "");
        setWishlistOpen(false);
        setCartOpen(true);
      } catch {
        // Product may have been removed
      }
    },
    [addToCart, isWishlisted, moveToCart, removeFromWishlist]
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
      addToCart,
      updateCart,
      removeFromCart,
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
      addToCart,
      updateCart,
      removeFromCart,
      handleToggleWishlist,
      handleRemoveFromWishlist,
      addWishlistToCart,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
