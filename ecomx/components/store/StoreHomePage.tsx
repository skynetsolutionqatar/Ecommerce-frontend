"use client";

import { Suspense, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import HeroSectionSplit from "@/components/HeroSectionSplit";
import FlashSaleSection from "@/components/FlashSaleSection";
import LazyMount from "@/components/LazyMount";
import { useStore } from "@/components/StoreProvider";
import MobileStoreHomeFeed from "@/components/store/mobile/MobileStoreHomeFeed";
import { useProducts } from "@/hooks/useProducts";
import { usePublicDeliverySettings } from "@/hooks/useDeliverySettings";
import { useStorefront } from "@/hooks/useStorefront";
import { PRODUCT_STATUS } from "@/lib/Constant";
import { apiProductImage } from "@/lib/store/api-product-display";
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

const MEGA_SALE_BACKGROUND =
  "linear-gradient(105deg, #e22123 0%, #ea580c 48%, #047857 100%)";

export default function StoreHomePage() {
  const router = useRouter();
  const { openProduct, goToShop, toggleWishlist, isWishlisted, setSearchOpen } = useStore();

  const { heroSlides, flashOffers, isLoading: storefrontLoading } = useStorefront();
  const heroLoading = storefrontLoading;
  const { data: deliverySettings } = usePublicDeliverySettings();

  const { data: dealData, isLoading: saleQueryLoading } = useProducts({
    status: PRODUCT_STATUS.ACTIVE,
    hasDiscount: true,
    limit: 8,
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

  const saleProducts = dealData?.products ?? [];
  const bestSellers = bestSellerData?.products ?? [];
  const newArrivals = newArrivalData?.products ?? [];
  const fallbackProducts = fallbackData?.products ?? [];

  const bestSellerProducts =
    bestSellers.length > 0 ? bestSellers : fallbackProducts.slice(0, 20);
  const newArrivalProducts =
    newArrivals.length > 0 ? newArrivals : fallbackProducts.slice(4, 24);

  /** Same as native home: storefront flash offers, then discounted catalog, then best sellers. */
  const hotDealProducts = useMemo(() => {
    const fromStorefront = flashOffers.slice(0, 8);
    if (fromStorefront.length > 0) return fromStorefront;
    const fromSale = saleProducts.slice(0, 8);
    if (fromSale.length > 0) return fromSale;
    return bestSellerProducts.slice(0, 8);
  }, [flashOffers, saleProducts, bestSellerProducts]);

  const hotDealsLoading =
    hotDealProducts.length === 0 && (storefrontLoading || saleQueryLoading);

  const bannerProducts = useMemo(() => {
    const seen = new Set(hotDealProducts.map((product) => product._id));
    const pool = [...newArrivalProducts, ...bestSellerProducts, ...saleProducts, ...fallbackProducts];
    const picked: ApiProduct[] = [];
    for (const product of pool) {
      if (!product?._id || seen.has(product._id) || !apiProductImage(product)) continue;
      seen.add(product._id);
      picked.push(product);
      if (picked.length >= 3) break;
    }
    return picked;
  }, [bestSellerProducts, fallbackProducts, hotDealProducts, newArrivalProducts, saleProducts]);

  const bannersLoading =
    bannerProducts.length === 0 && (newLoading || bestLoading || saleQueryLoading || fallbackLoading);

  const catalogDeals = saleProducts.length > 0 ? saleProducts : hotDealProducts;

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

  const goToShopCategory = useCallback((categoryId: string) => goToShop(categoryId), [goToShop]);

  useEffect(() => {
    void import("@/components/ShopPage");
    void import("@/components/ProductPage");
  }, []);

  return (
    <>
      <MobileStoreHomeFeed
        heroSlides={heroSlides}
        heroLoading={heroLoading}
        onHeroSlideAction={handleHeroSlideAction}
        hotDeals={hotDealProducts}
        hotDealsLoading={hotDealsLoading}
        catalogDeals={catalogDeals}
        bestSellerProducts={bestSellerProducts}
        bestLoading={bestLoading || (bestSellers.length === 0 && fallbackLoading)}
        newArrivalProducts={newArrivalProducts}
        newLoading={newLoading || (newArrivals.length === 0 && fallbackLoading)}
        deliverySettings={deliverySettings}
        onSearchOpen={() => setSearchOpen(true)}
        onCategorySelect={goToShopCategory}
        onShopAll={() => goToShop()}
        onProductClick={handleProductClick}
        onGoToShop={() => goToShop()}
        onWishlistToggle={toggleWishlist}
        isWishlisted={isWishlisted}
      />

      <div className="hidden min-h-screen bg-[#f1f3f6] pt-[var(--page-top)] md:block">
        <div className={tw.storeContainer}>
          <div className="mb-2">
            <HeroSectionSplit
              slides={heroSlides}
              isLoading={heroLoading}
              spotlightProducts={hotDealProducts}
              onSlideAction={handleHeroSlideAction}
              onViewAll={() => goToShop()}
              onProductClick={handleProductClick}
              bannerProducts={bannerProducts}
              bannersLoading={bannersLoading}
            />
          </div>

          <div className="mb-2 bg-white">
            <FlashSaleSection
              products={catalogDeals}
              isLoading={saleQueryLoading}
              onProductClick={handleProductClick}
              onViewAll={() => goToShop()}
              onWishlistToggle={toggleWishlist}
              isWishlisted={isWishlisted}
            />
          </div>

          <LazyMount minHeight="140px">
            <div className="mb-2">
              <Suspense fallback={null}>
                <PromoBannerStrip onCategoryClick={goToShopCategory} />
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
                  onCategoryClick={goToShopCategory}
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
            style={{ background: MEGA_SALE_BACKGROUND }}
          >
            <div
              className="flex cursor-pointer items-center justify-between px-10 py-8 md:py-10"
              onClick={() => goToShop()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && goToShop()}
            >
              <div>
                <div className={`mb-1 ${type.eyebrow} text-[9px] tracking-[0.2em] text-white/80`}>
                  LIMITED TIME OFFER
                </div>
                <div className="font-display text-[26px] font-extrabold leading-tight text-white md:text-[36px]">
                  MEGA SALE — Up to 50% OFF
                </div>
                <div className="mt-2 font-label text-[12px] text-white/85">
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
    </>
  );
}