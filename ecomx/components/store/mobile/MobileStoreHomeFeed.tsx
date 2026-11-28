"use client";

import { Suspense } from "react";
import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import LazyMount from "@/components/LazyMount";
import MobileAppHomeHeader from "@/components/store/MobileAppHomeHeader";
import MobileBiggestSavings from "@/components/store/mobile/MobileBiggestSavings";
import MobileFreeDeliveryStrip from "@/components/store/mobile/MobileFreeDeliveryStrip";
import MobileHomeDealCard from "@/components/store/mobile/MobileHomeDealCard";
import MobileHotDealsBlock from "@/components/store/mobile/MobileHotDealsBlock";
import { apiProductDiscountPercent } from "@/lib/store/api-product-display";
import { shopDealsUrl } from "@/lib/store/mobile-chrome";
import { tw } from "@/lib/theme";
import type { ApiProduct } from "@/types/product.types";
import type { HeroSlide } from "@/types/storefront.types";
import type { PublicDeliverySettings } from "@/types/delivery-settings.types";
import type { WishlistItem } from "@/lib/types";
import dynamic from "next/dynamic";

const PromoBannerStrip = dynamic(() => import("@/components/PromoBannerStrip"));
const HomeProductRow = dynamic(() => import("@/components/HomeProductRow"));
const CategoriesSection = dynamic(() => import("@/components/CategoriesSection"));

export default function MobileStoreHomeFeed({
  heroSlides,
  heroLoading,
  onHeroSlideAction,
  hotDeals,
  hotDealsLoading,
  catalogDeals,
  bestSellerProducts,
  bestLoading,
  newArrivalProducts,
  newLoading,
  deliverySettings,
  onSearchOpen,
  onCategorySelect,
  onShopAll,
  onProductClick,
  onGoToShop,
  onWishlistToggle,
  isWishlisted,
}: {
  heroSlides: HeroSlide[];
  heroLoading: boolean;
  onHeroSlideAction: (slide: HeroSlide) => void;
  hotDeals: ApiProduct[];
  hotDealsLoading: boolean;
  catalogDeals: ApiProduct[];
  bestSellerProducts: ApiProduct[];
  bestLoading: boolean;
  newArrivalProducts: ApiProduct[];
  newLoading: boolean;
  deliverySettings?: PublicDeliverySettings | null;
  onSearchOpen: () => void;
  onCategorySelect: (id: string) => void;
  onShopAll: () => void;
  onProductClick: (product: ApiProduct) => void;
  onGoToShop: () => void;
  onWishlistToggle: (item: WishlistItem) => void;
  isWishlisted: (id: string) => boolean;
}) {
  const biggestDeals = [...catalogDeals]
    .sort((a, b) => apiProductDiscountPercent(b) - apiProductDiscountPercent(a))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f1f3f6] md:hidden">
      <MobileAppHomeHeader
        onSearchOpen={onSearchOpen}
        onCategorySelect={(cat) => onCategorySelect(cat._id)}
        onShopAll={onShopAll}
        deliverySettings={deliverySettings}
      />

      <div
        className="pointer-events-none shrink-0"
        style={{ height: "var(--mobile-home-header-height, 168px)" }}
        aria-hidden
      />

      <MobileHotDealsBlock
        products={hotDeals}
        loading={hotDealsLoading}
        onProductPress={onProductClick}
      />

      <div className="pt-4">
        <MobileFreeDeliveryStrip settings={deliverySettings} />
      </div>

      <div className="mt-4 px-0">
        <HeroSection
          slides={heroSlides}
          isLoading={heroLoading}
          onSlideAction={onHeroSlideAction}
          onViewAll={onGoToShop}
        />
      </div>

      <LazyMount minHeight="120px">
        <div className="mt-4">
          <Suspense fallback={null}>
            <PromoBannerStrip onCategoryClick={(cat) => onCategorySelect(cat)} />
          </Suspense>
        </div>
      </LazyMount>

      <LazyMount minHeight="200px">
        <div className="mt-5 bg-white">
          <Suspense fallback={null}>
            <CategoriesSection
              onCategoryClick={onCategorySelect}
              onViewAll={onGoToShop}
            />
          </Suspense>
        </div>
      </LazyMount>

      <div className="mt-4">
        <MobileBiggestSavings products={biggestDeals} onProductPress={onProductClick} />
      </div>

      <section className="mt-4 bg-white pt-4">
        <div className="mb-3 flex items-center justify-between px-4">
          <h2 className="text-[20px] font-extrabold text-gray-900">Top Deals</h2>
          <Link href={shopDealsUrl()} className="text-sm font-extrabold text-[#0a255d]">
            See All
          </Link>
        </div>
        <div className={`flex gap-2.5 overflow-x-auto px-4 pb-2 ${tw.scrollbarHide}`}>
          {bestSellerProducts.slice(0, 8).map((product) => (
            <MobileHomeDealCard key={product._id} product={product} onPress={onProductClick} />
          ))}
        </div>
      </section>

      <LazyMount minHeight="280px">
        <div className="mt-4 bg-white">
          <Suspense fallback={null}>
            <HomeProductRow
              title="Best Sellers"
              subtitle="Top-rated products by Skynet customers"
              products={bestSellerProducts}
              isLoading={bestLoading}
              onProductClick={onProductClick}
              onViewAll={onGoToShop}
              onWishlistToggle={onWishlistToggle}
              isWishlisted={isWishlisted}
              bgColor="#ffffff"
            />
          </Suspense>
        </div>
      </LazyMount>

      <LazyMount minHeight="280px">
        <div className="mt-4 bg-white">
          <Suspense fallback={null}>
            <HomeProductRow
              title="New Arrivals"
              subtitle="Latest products just added"
              products={newArrivalProducts}
              isLoading={newLoading}
              onProductClick={onProductClick}
              onViewAll={onGoToShop}
              onWishlistToggle={onWishlistToggle}
              isWishlisted={isWishlisted}
              bgColor="#ffffff"
            />
          </Suspense>
        </div>
      </LazyMount>
    </div>
  );
}