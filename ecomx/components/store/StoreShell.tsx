"use client";

import { Suspense, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileStoreTabBar from "@/components/store/MobileStoreTabBar";
import { useStore } from "@/components/StoreProvider";
import { shouldShowMobileTabBar } from "@/lib/store/mobile-chrome";
import { apiProductToStoreProduct } from "@/lib/store/product-mapper";
import type { ApiProduct } from "@/types/product.types";
import { usePathname } from "next/navigation";
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
    addToCart,
    refreshCart,
    isWishlisted,
    toggleWishlist,
    updateCart,
    removeFromCart,
    removeFromWishlist,
    addWishlistToCart,
  } = useStore();

  const handleCategorySelect = (category: ApiCategory) => {
    goToShop(category._id);
  };

  const pathname = usePathname() ?? "/";
  const showMobileTabBar = shouldShowMobileTabBar(pathname);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="store-shell store-shell--mobile-web flex min-h-0 w-full flex-1 flex-col">
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

      <main className="store-mobile-main min-h-0 flex-1">{children}</main>
      <div className="hidden md:block">
        <Footer />
      </div>

      {showMobileTabBar ? (
        <Suspense fallback={null}>
          <MobileStoreTabBar
            cartCount={cartCount}
            cartOpen={cartOpen}
            onCartOpen={() => setCartOpen(true)}
            user={user}
            onLoginOpen={() => setLoginOpen(true)}
          />
        </Suspense>
      ) : null}

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
            onGoToShop={() => goToShop()}
            onUpdate={updateCart}
            onRemove={removeFromCart}
            onRefresh={() => void refreshCart()}
            isWishlisted={isWishlisted}
            onToggleWishlist={toggleWishlist}
            onAddProduct={(product: ApiProduct) => {
              const mapped = apiProductToStoreProduct(product);
              addToCart(mapped, mapped.colors[0]?.name ?? "", mapped.sizes[0] ?? "");
            }}
            onOpenProduct={(product: ApiProduct) => {
              setCartOpen(false);
              openProduct(apiProductToStoreProduct(product));
            }}
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
