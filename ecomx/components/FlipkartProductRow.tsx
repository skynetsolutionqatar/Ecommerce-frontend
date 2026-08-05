"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import HomeScrollProductCard from "@/components/store/HomeScrollProductCard";
import HomeProductRowSkeleton from "@/components/store/HomeProductRowSkeleton";
import * as Icons from "./Icons";
import { tw } from "@/lib/theme";
import type { ApiProduct } from "@/types/product.types";
import type { WishlistItem } from "@/lib/types";

interface FlipkartProductRowProps {
  title: string;
  subtitle?: string;
  products: ApiProduct[];
  isLoading?: boolean;
  onProductClick: (product: ApiProduct) => void;
  onViewAll: () => void;
  onWishlistToggle?: (item: WishlistItem) => void;
  isWishlisted?: (productId: string) => boolean;
  bgColor?: string;
}

export default function FlipkartProductRow({
  title,
  subtitle,
  products,
  isLoading = false,
  onProductClick,
  onViewAll,
  onWishlistToggle,
  isWishlisted,
  bgColor = "#ffffff",
}: FlipkartProductRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });
  };

  if (!isLoading && products.length === 0) return null;

  return (
    <section
      className="mb-4 overflow-hidden rounded-2xl border border-gray-100 shadow-sm"
      style={{ background: bgColor }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5 md:px-6 sm:py-4">
        <div>
          <h2 className="font-display text-[16px] font-extrabold text-gray-900 sm:text-[19px] md:text-[21px]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 font-label text-[13px] md:text-[11px] text-gray-500">{subtitle}</p>
          ) : null}
        </div>
        <motion.button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1.5 rounded-full border border-gray-800 px-4 py-1.5 font-label text-[12px] font-bold text-gray-800 transition-all hover:bg-gray-800 hover:text-white"
          whileTap={{ scale: 0.97 }}
        >
          View All <Icons.ArrowRight />
        </motion.button>
      </div>

      <div className="relative">
        {!isLoading && products.length > 0 ? (
          <>
            <button
              type="button"
              onClick={() => scroll("left")}
              className="absolute left-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-all hover:border-gray-400 hover:shadow-lg"
              style={{ marginTop: "-12px" }}
              aria-label="Previous"
            >
              <svg
                className="h-4 w-4 md:h-3.5 md:w-3.5 text-gray-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              className="absolute right-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-all hover:border-gray-400 hover:shadow-lg"
              style={{ marginTop: "-12px" }}
              aria-label="Next"
            >
              <svg
                className="h-4 w-4 md:h-3.5 md:w-3.5 text-gray-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        ) : null}

        {isLoading ? (
          <HomeProductRowSkeleton count={6} />
        ) : (
          <div
            ref={scrollRef}
            className={`flex items-stretch gap-3 overflow-x-auto scroll-smooth px-4 py-2 pb-4 sm:gap-4 sm:px-5 md:px-6 sm:pb-5 ${tw.scrollbarHide}`}
          >
            {products.map((product, i) => (
              <div key={product._id} className="relative shrink-0">
                <HomeScrollProductCard
                  product={product}
                  index={i}
                  onClick={onProductClick}
                  onWishlistToggle={onWishlistToggle}
                  isWishlisted={isWishlisted?.(product._id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
