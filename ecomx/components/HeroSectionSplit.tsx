"use client";

import HeroSection from "@/components/HeroSection";
import HeroSpotlightPoster from "@/components/HeroSpotlightPoster";
import HeroCatalogBanners from "@/components/store/HeroCatalogBanners";
import type { ApiProduct } from "@/types/product.types";
import type { HeroSlide } from "@/types/storefront.types";

/**
 * Desktop / tablet hero — 70% main carousel + 30% coupon & hot deals column (md+).
 * Mobile callers should use `HeroSection` full width.
 */
export default function HeroSectionSplit({
  slides,
  isLoading,
  spotlightProducts,
  onSlideAction,
  onViewAll,
  onProductClick,
  bannerProducts,
  bannersLoading,
}: {
  slides?: HeroSlide[];
  isLoading?: boolean;
  spotlightProducts?: ApiProduct[];
  onSlideAction?: (slide: HeroSlide) => void;
  onViewAll?: () => void;
  onProductClick?: (product: ApiProduct) => void;
  bannerProducts?: ApiProduct[];
  bannersLoading?: boolean;
}) {
  return (
    <div className="pb-2 pt-1">
      <div className="grid items-stretch gap-3 md:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:gap-4">
        <div className="flex min-h-0 min-w-0 flex-col gap-3">
          <HeroSection
            slides={slides}
            isLoading={isLoading}
            onSlideAction={onSlideAction}
            onViewAll={onViewAll}
            embedded
            className="w-full shrink-0"
          />
          <div className="min-h-[7.5rem] flex-1">
            <HeroCatalogBanners
              products={bannerProducts ?? []}
              isLoading={bannersLoading}
              onProductClick={onProductClick}
            />
          </div>
        </div>
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <HeroSpotlightPoster
            slides={slides}
            dealProducts={spotlightProducts}
            isLoading={isLoading}
            onSlideAction={onSlideAction}
            onViewAll={onViewAll}
            onProductClick={onProductClick}
            className="h-full min-h-0 max-h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}