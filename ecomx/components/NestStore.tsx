"use client";

import { Suspense, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FlashSaleSection from "@/components/FlashSaleSection";
import LazyMount from "@/components/LazyMount";
import { useStore } from "@/components/StoreProvider";
import { lazyClient, prefetchModules } from "@/lib/lazy";
import type { Product, WishlistItem } from "@/lib/types";
import type { StorePage } from "@/lib/routes";
import { tw, type } from "@/lib/theme";
import { PRODUCTS } from "@/lib/data";

const ShopPage = lazyClient(() => import("@/components/ShopPage"));
const ProductPage = lazyClient(() => import("@/components/ProductPage"));
const OrdersPage = lazyClient(() => import("@/components/Orders"));
const CheckoutPage = lazyClient(() => import("@/components/CheckoutPage"));
const PromoBannerStrip = lazyClient(() => import("@/components/PromoBannerStrip"));
const FlipkartProductRow = lazyClient(() => import("@/components/FlipkartProductRow"));
const CategoriesSection = lazyClient(() => import("@/components/CategoriesSection"));
const NewsletterSection = lazyClient(() => import("@/components/NewsletterSection"));

const SearchModal = lazyClient(() => import("@/components/SearchModal"), { ssr: false });
const LoginModal = lazyClient(() => import("@/components/LoginModal"), { ssr: false });
const CartDrawer = lazyClient(() => import("@/components/CartDrawer"), { ssr: false });
const WishlistDrawer = lazyClient(() => import("@/components/WishlistDrawer"), { ssr: false });

export default function NestStore() {
  const {
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
  } = useStore();

  const openProduct = (product: Product) => {
    navigate({ type: "product", product });
  };

  const renderPage = () => {
    switch (page.type) {
      case "shop":
        return (
          <Suspense fallback={null}>
            <ShopPage
              onAddToCart={addToCart}
              onWishlistToggle={toggleWishlist}
              wishlist={wishlist}
              onProductClick={openProduct}
              initialCategory={page.category}
              onHomeClick={() => navigate({ type: "home" })}
            />
          </Suspense>
        );

      case "product":
        return (
          <Suspense fallback={null}>
            <ProductPage
              key={page.product.id}
              product={page.product}
              onAddToCart={addToCart}
              onWishlistToggle={toggleWishlist}
              isWishlisted={wishlist.some((w) => w.id === page.product.id)}
              onBack={goBack}
              onProductClick={openProduct}
              wishlist={wishlist}
            />
          </Suspense>
        );

      case "checkout":
        return (
          <Suspense fallback={null}>
            <CheckoutPage onBack={goBack} cart={cart} />
          </Suspense>
        );

      case "orders":
        return (
          <Suspense fallback={null}>
            <OrdersPage onBack={goBack} />
          </Suspense>
        );

      default:
        return (
          <HomePage
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            wishlist={wishlist}
            navigate={navigate}
          />
        );
    }
  };

  return (
    <>
      <Header
        cart={cart}
        wishlist={wishlist}
        onCartOpen={() => setCartOpen(true)}
        onWishlistOpen={() => setWishlistOpen(true)}
        onSearchOpen={() => setSearchOpen(true)}
        onLoginOpen={() => setLoginOpen(true)}
        onLogout={() => setUser(null)}
        user={user}
        page={pageType}
        setPage={handleSetPage}
        onNavigateHome={() => navigate({ type: "home" })}
      />

      <main className="">{renderPage()}</main>
      <Footer />

      {searchOpen && (
        <Suspense fallback={null}>
          <SearchModal
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            onProductSelect={(p) => {
              setSearchOpen(false);
              openProduct(p);
            }}
          />
        </Suspense>
      )}
      {loginOpen && (
        <Suspense fallback={null}>
          <LoginModal
            open={loginOpen}
            onClose={() => setLoginOpen(false)}
            onSuccess={setUser}
            user={user}
            onLogout={() => {
              setUser(null);
              setLoginOpen(false);
            }}
          />
        </Suspense>
      )}
      {cartOpen && (
        <Suspense fallback={null}>
          <CartDrawer
            cart={cart}
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            onUpdate={updateCart}
            onRemove={removeFromCart}
            setPage={handleSetPage}
          />
        </Suspense>
      )}
      {wishlistOpen && (
        <Suspense fallback={null}>
          <WishlistDrawer
            wishlist={wishlist}
            open={wishlistOpen}
            onClose={() => setWishlistOpen(false)}
            onRemove={(id) => {
              const item = wishlist.find((w) => w.id === id);
              if (item) toggleWishlist(item);
            }}
            onAddToCart={addWishlistToCart}
          />
        </Suspense>
      )}
    </>
  );
}

// ── Flipkart-Style Homepage ────────────────────────────────────────────────────
function HomePage({
  addToCart,
  toggleWishlist,
  wishlist,
  navigate,
}: {
  addToCart: (p: Product, c: string, s: string) => void;
  toggleWishlist: (i: WishlistItem) => void;
  wishlist: WishlistItem[];
  navigate: (page: StorePage) => void;
}) {
  const openProduct = (product: Product) => navigate({ type: "product", product });
  const goShop = () => navigate({ type: "shop" });

  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller);
  const newArrivals = PRODUCTS.filter((p) => p.isNew);
  const allProducts = PRODUCTS;

  useEffect(() => {
    prefetchModules(
      () => import("@/components/ShopPage"),
      () => import("@/components/ProductPage"),
      () => import("@/components/SearchModal"),
      () => import("@/components/LoginModal"),
      () => import("@/components/CartDrawer"),
      () => import("@/components/PromoBannerStrip"),
      () => import("@/components/FlipkartProductRow"),
      () => import("@/components/CategoriesSection"),
      () => import("@/components/NewsletterSection")
    );
  }, []);

  return (
    <div className={`${tw.pageTopOffset} min-h-screen`} style={{ background: "#f1f3f6" }}>
      <div className="mx-auto max-w-[1440px] px-3 sm:px-5 md:px-8 lg:px-[50px]" >

        {/* 1. Full-width hero slider */}
        <div className="mb-2">
          <HeroSection onViewAll={goShop} />
        </div>

        {/* 2. Flash Sale / Deal of the Day */}
        <div className="mb-2 bg-white">
          <FlashSaleSection onProductClick={openProduct} onViewAll={goShop} />
        </div>

        {/* 3. Promo banners */}
        <LazyMount>
          <div className="mb-2">
            <Suspense fallback={null}>
              <PromoBannerStrip onCategoryClick={(cat) => navigate({ type: "shop", category: cat })} />
            </Suspense>
          </div>
        </LazyMount>

        {/* 4. Best Sellers */}
        <LazyMount>
          <div className="mb-2 bg-white">
            <Suspense fallback={null}>
              <FlipkartProductRow
                title="Best Sellers"
                subtitle="Top-rated products by Skynet customers"
                products={bestSellers.length > 0 ? bestSellers : allProducts}
                onProductClick={openProduct}
                onViewAll={goShop}
                bgColor="#ffffff"
              />
            </Suspense>
          </div>
        </LazyMount>

        {/* 5. Shop by Category */}
        <LazyMount>
          <div className="mb-2 bg-white">
            <Suspense fallback={null}>
              <CategoriesSection
                onCategoryClick={(cat) => navigate({ type: "shop", category: cat })}
                onViewAll={goShop}
              />
            </Suspense>
          </div>
        </LazyMount>

        {/* 6. New Arrivals */}
        <LazyMount>
          <div className="mb-2 bg-white">
            <Suspense fallback={null}>
              <FlipkartProductRow
                title="New Arrivals"
                subtitle="Latest products just added"
                products={newArrivals.length > 0 ? newArrivals : allProducts.slice(4)}
                onProductClick={openProduct}
                onViewAll={goShop}
                bgColor="#ffffff"
              />
            </Suspense>
          </div>
        </LazyMount>

        {/* 7. Mega Sale Banner */}
        <div className="mb-2 overflow-hidden" style={{ background: "linear-gradient(135deg, #0a255dff 0%, #1e293b 40%, #334155 100%)" }}>
          <div
            className="flex cursor-pointer items-center justify-between px-10 py-8 md:py-10"
            onClick={goShop} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && goShop()}
          >
            <div>
              <div className={`mb-1 ${type.eyebrow} text-[9px] tracking-[0.2em] text-slate-400/70`}>LIMITED TIME OFFER</div>
              <div className="font-display text-[26px] font-extrabold leading-tight text-white md:text-[36px]">
                MEGA SALE — Up to 50% OFF
              </div>
              <div className="mt-2 font-label text-[12px] text-slate-300/60">
                Free installation on all POS systems · Qatar VAT Compliant
              </div>
              <div
                className="mt-4 inline-flex items-center gap-2 rounded-lg px-6 py-2.5 font-label text-[13px] font-bold text-white transition-all hover:opacity-90"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
              >
                Shop Now →
              </div>
            </div>
            <div className="hidden shrink-0 md:flex flex-col items-center justify-center">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-2xl text-[42px] font-black text-white"
                style={{ background: "rgba(255,255,255,0.10)", border: "1.5px solid rgba(255,255,255,0.18)" }}
              >
                %
              </div>
            </div>
          </div>
        </div>

        {/* 8. Newsletter */}
        <LazyMount>
          <Suspense fallback={null}>
            <NewsletterSection />
          </Suspense>
        </LazyMount>

      </div>
    </div>
  );
}



