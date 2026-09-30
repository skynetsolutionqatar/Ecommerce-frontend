"use client";

import { Suspense, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStore } from "@/components/StoreProvider";
import type { ApiCategory } from "@/types/category.types";

const SearchModal = dynamic(() => import("@/components/SearchModal"), { ssr: false });
const LoginModal = dynamic(() => import("@/components/LoginModal"), { ssr: false });
const CartDrawer = dynamic(() => import("@/components/CartDrawer"), { ssr: false });
const WishlistDrawer = dynamic(() => import("@/components/WishlistDrawer"), { ssr: false });

export default function StoreShell({ children }: { children: ReactNode }) {
  const {
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
    logout,
    openProduct,
    goToShop,
    updateCart,
    removeFromCart,
    removeFromWishlist,
    addWishlistToCart,
  } = useStore();

  const handleCategorySelect = (category: ApiCategory) => {
    goToShop(category._id);
  };

  return (
    <div className="store-shell flex min-h-0 w-full flex-1 flex-col">
      <Header
        cart={cart}
        wishlist={wishlist}
        onCartOpen={() => setCartOpen(true)}
        onWishlistOpen={() => setWishlistOpen(true)}
        onSearchOpen={() => setSearchOpen(true)}
        onLoginOpen={() => setLoginOpen(true)}
        onLogout={logout}
        user={user}
        onCategorySelect={handleCategorySelect}
      />

      <main>{children}</main>
      <Footer />

      {searchOpen ? (
        <Suspense fallback={null}>
          <SearchModal
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            onProductSelect={(product) => {
              setSearchOpen(false);
              openProduct(product);
            }}
          />
        </Suspense>
      ) : null}

      {loginOpen ? (
        <Suspense fallback={null}>
          <LoginModal
            open={loginOpen}
            onClose={() => setLoginOpen(false)}
            onSuccess={() => {}}
            user={user}
            onLogout={() => {
              logout();
              setLoginOpen(false);
            }}
          />
        </Suspense>
      ) : null}

      {cartOpen ? (
        <Suspense fallback={null}>
          <CartDrawer
            cart={cart}
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            onUpdate={updateCart}
            onRemove={removeFromCart}
          />
        </Suspense>
      ) : null}

      {wishlistOpen ? (
        <Suspense fallback={null}>
          <WishlistDrawer
            wishlist={wishlist}
            open={wishlistOpen}
            onClose={() => setWishlistOpen(false)}
            onRemove={removeFromWishlist}
            onAddToCart={addWishlistToCart}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
