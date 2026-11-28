"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Monitor, Printer, Sparkles, Tag } from "lucide-react";
import MobileAppHomeHeader from "@/components/store/MobileAppHomeHeader";
import MobileBiggestSavings from "@/components/store/mobile/MobileBiggestSavings";
import MobileFreeDeliveryStrip from "@/components/store/mobile/MobileFreeDeliveryStrip";
import MobileHomeDealCard from "@/components/store/mobile/MobileHomeDealCard";
import MobileHomeHeroSlider from "@/components/store/mobile/MobileHomeHeroSlider";
import MobileHotDealsBlock from "@/components/store/mobile/MobileHotDealsBlock";
import StoreImage from "@/components/StoreImage";
import { useCategories, STORE_CATEGORY_QUERY } from "@/hooks/useCategories";
import { apiProductDiscountPercent, apiProductImage } from "@/lib/store/api-product-display";
import { resolveCategoryIcon } from "@/lib/store/category-icons";
import { shopDealsUrl } from "@/lib/store/mobile-chrome";
import { shopUrl as listingUrl } from "@/lib/routes";
import { tw } from "@/lib/theme";
import type { ApiProduct } from "@/types/product.types";
import type { HeroSlide } from "@/types/storefront.types";
import type { PublicDeliverySettings } from "@/types/delivery-settings.types";
import type { WishlistItem } from "@/lib/types";

const TILES = [
  { id: "savings", title: "SAVINGS\nZONE", href: shopDealsUrl(), tone: "danger" as const },
  {
    id: "online",
    title: "ONLINE\nEXCLUSIVE",
    href: listingUrl({ isNew: true, listing: true }),
    tone: "surface" as const,
  },
  {
    id: "electronics",
    title: "Electronics\nEssentials",
    href: listingUrl({ search: "POS", listing: true }),
    tone: "surface" as const,
  },
  { id: "home", title: "Store\nHardware", href: listingUrl({ listing: true }), tone: "surface" as const },
];

export default function MobileStoreHomeFeed({
  heroSlides,
  heroLoading,
  onHeroSlideAction,
  hotDeals,
  hotDealsLoading,
  catalogDeals,
  bestSellerProducts,
  newArrivalProducts,
  deliverySettings,
  onSearchOpen,
  onCategorySelect,
  onShopAll,
  onProductClick,
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
  const { scrollY } = useScroll();
  const heroShift = useTransform(scrollY, [0, 180], [0, -14]);
  const { data } = useCategories(STORE_CATEGORY_QUERY);
  const categories = (data?.categories ?? []).slice(0, 8);

  const biggestDeals = [...catalogDeals]
    .sort((a, b) => apiProductDiscountPercent(b) - apiProductDiscountPercent(a))
    .slice(0, 3);

  const tileImage = (id: string) => {
    if (id === "savings") return biggestDeals[0] ? apiProductImage(biggestDeals[0]) : undefined;
    if (id === "online") return newArrivalProducts.map(apiProductImage).find(Boolean);
    if (id === "electronics") return bestSellerProducts.map(apiProductImage).find(Boolean);
    return hotDeals.map(apiProductImage).find(Boolean);
  };

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

      <motion.div className="pt-4" style={{ y: heroShift }}>
        <MobileHomeHeroSlider
          slides={heroSlides}
          loading={heroLoading}
          onPress={onHeroSlideAction}
        />
      </motion.div>

      <div className={`flex gap-2 overflow-x-auto px-4 pt-4 ${tw.scrollbarHide}`}>
        {TILES.map((tile) => {
          const image = tileImage(tile.id);
          const danger = tile.tone === "danger";
          return (
            <Link
              key={tile.id}
              href={tile.href}
              className="h-[126px] w-[108px] shrink-0 rounded-[14px] border-2 border-gray-900 p-[3px]"
            >
              <span
                className={`flex h-full flex-col justify-between overflow-hidden rounded-[10px] p-2 ${
                  danger ? "bg-red-600 text-white" : "bg-white text-[#0a255d]"
                }`}
              >
                <span className="whitespace-pre-line text-[15px] font-extrabold leading-[18px]">
                  {tile.title}
                </span>
                {image ? (
                  <span className="block h-[58px] overflow-hidden rounded-lg bg-[#f4f6f8]">
                    <StoreImage src={image} alt="" className="h-full w-full object-contain p-1" />
                  </span>
                ) : (
                  <span className="flex justify-center">
                    {tile.id === "savings" ? (
                      <Tag className="h-7 w-7" />
                    ) : tile.id === "online" ? (
                      <Sparkles className="h-7 w-7" />
                    ) : tile.id === "electronics" ? (
                      <Monitor className="h-7 w-7" />
                    ) : (
                      <Printer className="h-7 w-7" />
                    )}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </div>

      <Link
        href={shopDealsUrl()}
        className="mx-4 mt-5 flex min-h-[100px] items-center overflow-hidden rounded-[14px] bg-red-600 px-4 py-4 text-white"
      >
        <span>
          <span className="block text-[10px] font-extrabold uppercase">SKYNET weekly offers</span>
          <span className="mt-0.5 block text-[28px] font-extrabold italic leading-8">BIGGER THAN EVER</span>
          <span className="mt-1 block text-[13px] font-bold">Labels, printers, scanners and POS</span>
        </span>
      </Link>

      {categories.length > 0 ? (
        <section className="px-4 pt-5">
          <h2 className="text-[18px] font-extrabold text-gray-900">Top Categories</h2>
          <div className="mt-3 grid grid-cols-4 gap-2.5">
            {categories.map((category) => (
              <button
                key={category._id}
                type="button"
                onClick={() => onCategorySelect(category._id)}
                className="flex flex-col items-center gap-1.5 border-0 bg-transparent p-0"
              >
                <span className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white text-[#0a255d]">
                  {category.image ? (
                    <StoreImage src={category.image} alt="" className="h-full w-full object-contain p-2" />
                  ) : (
                    resolveCategoryIcon(category.name)
                  )}
                </span>
                <span className="line-clamp-2 w-full text-center text-[10px] font-bold leading-[13px] text-[#0a255d]">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="pt-4">
        <MobileBiggestSavings products={biggestDeals} onProductPress={onProductClick} />
      </div>

      <section className="bg-[#f1f3f6] pt-4">
        <div className="mb-3 flex items-center justify-between px-4">
          <h2 className="text-[20px] font-extrabold text-gray-900">Top Deals</h2>
          <Link href={shopDealsUrl()} className="text-sm font-extrabold text-[#0a255d]">
            See All
          </Link>
        </div>
        <div className={`flex gap-[10px] overflow-x-auto px-4 pb-2 ${tw.scrollbarHide}`}>
          {bestSellerProducts.slice(0, 8).map((product) => (
            <MobileHomeDealCard key={product._id} product={product} onPress={onProductClick} />
          ))}
        </div>
      </section>
    </div>
  );
}
