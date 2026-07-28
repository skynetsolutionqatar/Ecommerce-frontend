"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HomeScrollProductCard from "@/components/store/HomeScrollProductCard";
import HomeProductRowSkeleton from "@/components/store/HomeProductRowSkeleton";
import * as Icons from "./Icons";
import { tw } from "@/lib/theme";
import type { ApiProduct } from "@/types/product.types";
import type { WishlistItem } from "@/lib/types";

interface FlashSaleSectionProps {
  products: ApiProduct[];
  isLoading?: boolean;
  onProductClick: (product: ApiProduct) => void;
  onViewAll: () => void;
  onWishlistToggle?: (item: WishlistItem) => void;
  isWishlisted?: (productId: string) => boolean;
}

function useCountdown(targetHours = 8) {
  const [time, setTime] = useState({ h: targetHours, m: 0, s: 0 });

  useEffect(() => {
    const end = Date.now() + targetHours * 3600 * 1000;
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetHours]);

  return time;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function FlashSaleSection({
  products,
  isLoading = false,
  onProductClick,
  onViewAll,
  onWishlistToggle,
  isWishlisted,
}: FlashSaleSectionProps) {
  const time = useCountdown(7);

  if (!isLoading && products.length === 0) return null;

  return (
    <section
      className="mb-4 overflow-hidden rounded-2xl border border-gray-100 shadow-sm"
      style={{ background: "#ffffff" }}
    >
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-5 md:px-6 sm:py-3.5"
        style={{ background: "linear-gradient(135deg, #0a255dff 0%, #1e293b 60%, #334155 100%)" }}
      >
        <div className="flex items-center gap-2">
          <motion.span
            className="text-xl"
            animate={{ rotate: [-5, 5, -5], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            🔥
          </motion.span>
          <h2 className="font-display text-[14px] font-extrabold text-white sm:text-[17px] md:text-xl">
            Deal of the Day
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-label text-[11px] font-medium text-slate-300">Ends in</span>
          <div className="flex items-center gap-1">
            {[
              { v: time.h, l: "H" },
              { v: time.m, l: "M" },
              { v: time.s, l: "S" },
            ].map(({ v, l }, i) => (
              <span key={l} className="flex items-center gap-1">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={v}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="flex h-7 min-w-[28px] flex-col items-center justify-center rounded-md border border-white/20 bg-white/15 px-1.5 font-mono text-[13px] font-extrabold tabular-nums text-white"
                  >
                    {pad(v)}
                  </motion.span>
                </AnimatePresence>
                {i < 2 ? <span className="text-sm font-bold text-white/60">:</span> : null}
              </span>
            ))}
          </div>
        </div>

        <motion.button
          type="button"
          onClick={onViewAll}
          className="ml-auto flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 font-label text-[12px] font-bold text-gray-800"
          whileHover={{ scale: 1.05, boxShadow: "0 4px 16px rgba(255,255,255,0.3)" }}
          whileTap={{ scale: 0.97 }}
        >
          View All Deals <Icons.ArrowRight />
        </motion.button>
      </div>

      {isLoading ? (
        <div className="bg-gray-50 py-3 sm:py-4">
          <HomeProductRowSkeleton count={6} />
        </div>
      ) : (
        <div
          className={`flex gap-2 overflow-x-auto scroll-smooth bg-gray-50 px-4 py-3 sm:gap-3 sm:px-5 md:px-6 sm:py-4 ${tw.scrollbarHide}`}
        >
          {products.map((product, i) => (
            <HomeScrollProductCard
              key={product._id}
              product={product}
              index={i}
              imageHeight={120}
              showBrand={false}
              onClick={onProductClick}
              onWishlistToggle={onWishlistToggle}
              isWishlisted={isWishlisted?.(product._id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
