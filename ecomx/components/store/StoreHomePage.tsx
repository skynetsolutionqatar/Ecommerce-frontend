"use client";

import { Suspense, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import FlashSaleSection from "@/components/FlashSaleSection";
import LazyMount from "@/components/LazyMount";
import { useStore } from "@/components/StoreProvider";
import { PRODUCTS } from "@/lib/data";
import { tw, type } from "@/lib/theme";
import dynamic from "next/dynamic";

const PromoBannerStrip = dynamic(() => import("@/components/PromoBannerStrip"));
const FlipkartProductRow = dynamic(() => import("@/components/FlipkartProductRow"));
const CategoriesSection = dynamic(() => import("@/components/CategoriesSection"));
const NewsletterSection = dynamic(() => import("@/components/NewsletterSection"));

export default function StoreHomePage() {
  const { openProduct, goToShop, toggleWishlist, isWishlisted } = useStore();

  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller);
  const newArrivals = PRODUCTS.filter((p) => p.isNew);
  const allProducts = PRODUCTS;

  useEffect(() => {
    void import("@/components/ShopPage");
    void import("@/components/ProductPage");
  }, []);

  return (
    <div className={`${tw.pageTopOffset} min-h-screen`} style={{ background: "#f1f3f6" }}>
      <div className="mx-auto max-w-[1440px] px-3 sm:px-5 md:px-8 lg:px-[50px]">
        <div className="mb-2">
          <HeroSection onViewAll={() => goToShop()} />
        </div>

        <div className="mb-2 bg-white">
          <FlashSaleSection
            onProductClick={openProduct}
            onViewAll={() => goToShop()}
            onWishlistToggle={toggleWishlist}
            isWishlisted={isWishlisted}
          />
        </div>

        <LazyMount>
          <div className="mb-2">
            <Suspense fallback={null}>
              <PromoBannerStrip onCategoryClick={(cat) => goToShop(cat)} />
            </Suspense>
          </div>
        </LazyMount>

        <LazyMount>
          <div className="mb-2 bg-white">
            <Suspense fallback={null}>
              <FlipkartProductRow
                title="Best Sellers"
                subtitle="Top-rated products by Skynet customers"
                products={bestSellers.length > 0 ? bestSellers : allProducts}
                onProductClick={openProduct}
                onViewAll={() => goToShop()}
                onWishlistToggle={toggleWishlist}
                isWishlisted={isWishlisted}
                bgColor="#ffffff"
              />
            </Suspense>
          </div>
        </LazyMount>

        <LazyMount>
          <div className="mb-2 bg-white">
            <Suspense fallback={null}>
              <CategoriesSection
                onCategoryClick={(categoryId) => goToShop(categoryId)}
                onViewAll={() => goToShop()}
              />
            </Suspense>
          </div>
        </LazyMount>

        <LazyMount>
          <div className="mb-2 bg-white">
            <Suspense fallback={null}>
              <FlipkartProductRow
                title="New Arrivals"
                subtitle="Latest products just added"
                products={newArrivals.length > 0 ? newArrivals : allProducts.slice(4)}
                onProductClick={openProduct}
                onViewAll={() => goToShop()}
                onWishlistToggle={toggleWishlist}
                isWishlisted={isWishlisted}
                bgColor="#ffffff"
              />
            </Suspense>
          </div>
        </LazyMount>

        <div
          className="mb-2 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0a255dff 0%, #1e293b 40%, #334155 100%)",
          }}
        >
          <div
            className="flex cursor-pointer items-center justify-between px-10 py-8 md:py-10"
            onClick={() => goToShop()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && goToShop()}
          >
            <div>
              <div className={`mb-1 ${type.eyebrow} text-[9px] tracking-[0.2em] text-slate-400/70`}>
                LIMITED TIME OFFER
              </div>
              <div className="font-display text-[26px] font-extrabold leading-tight text-white md:text-[36px]">
                MEGA SALE — Up to 50% OFF
              </div>
              <div className="mt-2 font-label text-[12px] text-slate-300/60">
                Free installation on all POS systems · Qatar VAT Compliant
              </div>
              <div
                className="mt-4 inline-flex items-center gap-2 rounded-lg px-6 py-2.5 font-label text-[13px] font-bold text-white transition-all hover:opacity-90"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                Shop Now →
              </div>
            </div>
            <div className="hidden shrink-0 flex-col items-center justify-center md:flex">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-2xl text-[42px] font-black text-white"
                style={{
                  background: "rgba(255,255,255,0.10)",
                  border: "1.5px solid rgba(255,255,255,0.18)",
                }}
              >
                %
              </div>
            </div>
          </div>
        </div>

        <LazyMount>
          <Suspense fallback={null}>
            <NewsletterSection />
          </Suspense>
        </LazyMount>
      </div>
    </div>
  );
}
