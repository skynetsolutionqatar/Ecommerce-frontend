"use client";

import { Suspense, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeroSection from "@/components/HeroSection";
import FlashSaleSection from "@/components/FlashSaleSection";
import LazyMount from "@/components/LazyMount";
import { useStore } from "@/components/StoreProvider";
import { useProducts } from "@/hooks/useProducts";
import { useStorefront } from "@/hooks/useStorefront";
import { PRODUCT_STATUS } from "@/lib/Constant";
import { apiProductToStoreProduct } from "@/lib/store/product-mapper";
import { ROUTES } from "@/lib/routes";
import { tw, type } from "@/lib/theme";
import type { ApiProduct } from "@/types/product.types";
import type { HeroSlide } from "@/types/storefront.types";
import dynamic from "next/dynamic";

const PromoBannerStrip = dynamic(() => import("@/components/PromoBannerStrip"));
const HomeProductRow = dynamic(() => import("@/components/HomeProductRow"));
const CategoriesSection = dynamic(() => import("@/components/CategoriesSection"));
const NewsletterSection = dynamic(() => import("@/components/NewsletterSection"));

export default function StoreHomePage() {
  const router = useRouter();
  const { openProduct, goToShop, toggleWishlist, isWishlisted } = useStore();

  const { heroSlides, isLoading: heroLoading } = useStorefront();

  const { data: dealData, isLoading: dealsLoading } = useProducts({
    status: PRODUCT_STATUS.ACTIVE,
    hasDiscount: true,
    limit: 16,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data: bestSellerData, isLoading: bestLoading } = useProducts({
    status: PRODUCT_STATUS.ACTIVE,
    isBestSeller: true,
    limit: 20,
    sortBy: "totalSold",
    sortOrder: "desc",
  });

  const { data: newArrivalData, isLoading: newLoading } = useProducts({
    status: PRODUCT_STATUS.ACTIVE,
    isNew: true,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data: fallbackData, isLoading: fallbackLoading } = useProducts({
    status: PRODUCT_STATUS.ACTIVE,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const deals = dealData?.products ?? [];
  const bestSellers = bestSellerData?.products ?? [];
  const newArrivals = newArrivalData?.products ?? [];
  const fallbackProducts = fallbackData?.products ?? [];

  const bestSellerProducts =
    bestSellers.length > 0 ? bestSellers : fallbackProducts.slice(0, 20);
  const newArrivalProducts =
    newArrivals.length > 0 ? newArrivals : fallbackProducts.slice(4, 24);

  const handleProductClick = useCallback(
    (product: ApiProduct) => {
      openProduct(apiProductToStoreProduct(product));
    },
    [openProduct]
  );

  const handleHeroSlideAction = useCallback(
    (slide: HeroSlide) => {
      if (slide.slug) {
        router.push(ROUTES.product(slide.slug));
        return;
      }
      goToShop();
    },
    [goToShop, router]
  );

  useEffect(() => {
    void import("@/components/ShopPage");
    void import("@/components/ProductPage");
  }, []);

  return (
    <div className={`${tw.pageTopOffset} min-h-screen`} style={{ background: "#f1f3f6" }}>
      <div className={tw.storeContainer}>
        <div className="mb-2">
          <HeroSection
            slides={heroSlides}
            isLoading={heroLoading}
            onSlideAction={handleHeroSlideAction}
            onViewAll={() => goToShop()}
          />
        </div>

        <div className="mb-2 bg-white">
          <FlashSaleSection
            products={deals}
            isLoading={dealsLoading}
            onProductClick={handleProductClick}
            onViewAll={() => goToShop()}
            onWishlistToggle={toggleWishlist}
            isWishlisted={isWishlisted}
          />
        </div>

        <LazyMount minHeight="140px">
          <div className="mb-2">
            <Suspense fallback={null}>
              <PromoBannerStrip onCategoryClick={(cat) => goToShop(cat)} />
            </Suspense>
          </div>
        </LazyMount>

        <LazyMount minHeight="360px">
          <div className="mb-2 bg-white">
            <Suspense fallback={null}>
              <HomeProductRow
                title="Best Sellers"
                subtitle="Top-rated products by Skynet customers"
                products={bestSellerProducts}
                isLoading={bestLoading || (bestSellers.length === 0 && fallbackLoading)}
                onProductClick={handleProductClick}
                onViewAll={() => goToShop()}
                onWishlistToggle={toggleWishlist}
                isWishlisted={isWishlisted}
                bgColor="#ffffff"
              />
            </Suspense>
          </div>
        </LazyMount>

        <LazyMount minHeight="240px">
          <div className="mb-2 bg-white">
            <Suspense fallback={null}>
              <CategoriesSection
                onCategoryClick={(categoryId) => goToShop(categoryId)}
                onViewAll={() => goToShop()}
              />
            </Suspense>
          </div>
        </LazyMount>

        <LazyMount minHeight="360px">
          <div className="mb-2 bg-white">
            <Suspense fallback={null}>
              <HomeProductRow
                title="New Arrivals"
                subtitle="Latest products just added"
                products={newArrivalProducts}
                isLoading={newLoading || (newArrivals.length === 0 && fallbackLoading)}
                onProductClick={handleProductClick}
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

        <LazyMount minHeight="280px">
          <Suspense fallback={null}>
            <NewsletterSection />
          </Suspense>
        </LazyMount>
      </div>
    </div>
  );
}
