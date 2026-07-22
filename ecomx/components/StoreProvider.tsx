"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PRODUCTS } from "@/lib/data";
import { authUserToStoreUser } from "@/lib/auth-utils";
import {
  pageToPath,
  pathToPage,
  pageTypeFromPath,
  ROUTES,
  type StorePage,
} from "@/lib/routes";
import { useAuthStore } from "@/store/auth.store";
import type { CartItem, Product, StoreUser, WishlistItem } from "@/lib/types";

interface StoreContextValue {
  page: StorePage;
  pageType: string;
  cart: CartItem[];
  wishlist: WishlistItem[];
  cartOpen: boolean;
  wishlistOpen: boolean;
  searchOpen: boolean;
  loginOpen: boolean;
  user: StoreUser | null;
  setCartOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setLoginOpen: (open: boolean) => void;
  setUser: (user: StoreUser | null) => void;
  navigate: (page: StorePage, options?: { replace?: boolean }) => void;
  goBack: () => void;
  handleSetPage: (p: string) => void;
  addToCart: (product: Product, color: string, size: string) => void;
  updateCart: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  toggleWishlist: (item: WishlistItem) => void;
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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = useMemo(
    () => pathToPage(pathname, searchParams),
    [pathname, searchParams]
  );

  const pageType = useMemo(() => pageTypeFromPath(pathname), [pathname]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const authUser = useAuthStore((s) => s.user);
  const isAuthHydrated = useAuthStore((s) => s.isHydrated);

  const user = useMemo<StoreUser | null>(() => {
    if (!isAuthHydrated || !authUser) return null;
    return authUserToStoreUser(authUser);
  }, [authUser, isAuthHydrated]);

  const setUser = useCallback((next: StoreUser | null) => {
    if (next === null) {
      useAuthStore.getState().clearAuth();
    }
  }, []);

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const navigate = useCallback(
    (next: StorePage, options?: { replace?: boolean }) => {
      scrollTop();
      const path = pageToPath(next);
      if (options?.replace) router.replace(path);
      else router.push(path);
    },
    [router, scrollTop]
  );

  const goBack = useCallback(() => {
    scrollTop();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(ROUTES.home);
    }
  }, [router, scrollTop]);

  const handleSetPage = useCallback(
    (p: string) => {
      if (p === "home") navigate({ type: "home" });
      else if (p === "shop") navigate({ type: "shop" });
      else if (p === "checkout") navigate({ type: "checkout" });
      else if (p === "cart") setCartOpen(true);
      else if (p === "orders") navigate({ type: "orders" });
      else if (p === "login") setLoginOpen(true);
      else if (p === "support") navigate({ type: "shop" });
    },
    [navigate]
  );

  const addToCart = useCallback((product: Product, color: string, size: string) => {
    const id = `${product.id}-${color}-${size}`;
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) return prev.map(i => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
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
    if (qty < 1) setCart(prev => prev.filter(i => i.id !== id));
    else setCart(prev => prev.map(i => (i.id === id ? { ...i, qty } : i)));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const toggleWishlist = useCallback((item: WishlistItem) => {
    setWishlist(prev =>
      prev.find(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item]
    );
  }, []);

  const addWishlistToCart = useCallback(
    (item: WishlistItem) => {
      const product = PRODUCTS.find(p => p.id === item.id);
      if (!product) return;
      addToCart(product, product.colors[0].name, product.sizes[0]);
      setWishlistOpen(false);
      setCartOpen(true);
    },
    [addToCart]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      page,
      pageType,
      cart,
      wishlist,
      cartOpen,
      wishlistOpen,
      searchOpen,
      loginOpen,
      user,
      setCartOpen,
      setWishlistOpen,
      setSearchOpen,
      setLoginOpen,
      setUser,
      navigate,
      goBack,
      handleSetPage,
      addToCart,
      updateCart,
      removeFromCart,
      toggleWishlist,
      addWishlistToCart,
    }),
    [
      page,
      pageType,
      cart,
      wishlist,
      cartOpen,
      wishlistOpen,
      searchOpen,
      loginOpen,
      user,
      navigate,
      goBack,
      handleSetPage,
      addToCart,
      updateCart,
      removeFromCart,
      toggleWishlist,
      addWishlistToCart,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
