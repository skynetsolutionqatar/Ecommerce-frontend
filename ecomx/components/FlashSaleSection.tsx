"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCTS, fmt } from "@/lib/data";
import StoreImage from "./StoreImage";
import * as Icons from "./Icons";
import { type, tw } from "@/lib/theme";
import type { Product } from "@/lib/types";

interface FlashSaleSectionProps {
  onProductClick: (product: Product) => void;
  onViewAll: () => void;
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

function pad(n: number) { return String(n).padStart(2, "0"); }

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
          <svg key={i} className="h-2.5 w-2.5" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "#F59E0B" : "#D1D5DB"}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>
      <span className="font-label text-[9px] text-gray-400">({reviews})</span>
    </div>
  );
}

export default function FlashSaleSection({ onProductClick, onViewAll }: FlashSaleSectionProps) {
  const time = useCountdown(7);
  const deals = PRODUCTS.filter(p => p.originalPrice).slice(0, 8);

  return (
    <section className="mb-4 overflow-hidden rounded-2xl shadow-sm border border-gray-100" style={{ background: "#ffffff" }}>
      {/* Header */}
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-5 md:px-6 sm:py-3.5"
        style={{ background: "linear-gradient(135deg, #0a255dff 0%, #1e293b 60%, #334155 100%)" }}
      >
        {/* Fire icon + title */}
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

        {/* Countdown */}
        <div className="flex items-center gap-2">
          <span className="font-label text-[11px] font-medium text-slate-300">Ends in</span>
          <div className="flex items-center gap-1">
            {[{ v: time.h, l: "H" }, { v: time.m, l: "M" }, { v: time.s, l: "S" }].map(({ v, l }, i) => (
              <span key={l} className="flex items-center gap-1">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={v}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="flex h-7 min-w-[28px] flex-col items-center justify-center rounded-md bg-white/15 px-1.5 font-mono text-[13px] font-extrabold text-white tabular-nums border border-white/20"
                  >
                    {pad(v)}
                  </motion.span>
                </AnimatePresence>
                {i < 2 && <span className="font-bold text-white/60 text-sm">:</span>}
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

      {/* Cards */}
      <div className={`flex gap-2 overflow-x-auto scroll-smooth ${tw.scrollbarHide} bg-gray-50 px-4 py-3 sm:gap-3 sm:px-5 md:px-6 sm:py-4`}>
        {deals.map((product, i) => {
          const discount = product.originalPrice
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : null;

          return (
            <motion.button
              key={product.id}
              type="button"
              onClick={() => onProductClick(product)}
              className="group flex shrink-0 flex-col text-left"
              style={{
                width: "clamp(145px, 19vw, 178px)",
                background: "#fff",
                borderRadius: "14px",
                border: "1.5px solid #f0f0f0",
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              whileHover={{
                y: -4,
                boxShadow: "0 14px 36px rgba(17,24,39,0.13)",
                borderColor: "#9CA3AF",
              }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Image */}
              <div
                className="relative mx-2 mt-2 flex items-center justify-center overflow-hidden"
                style={{
                  borderRadius: "10px",
                  height: "120px",
                  background: "linear-gradient(135deg, #f8f9fa, #f3f4f6)",
                }}
              >
                <motion.div
                  className="h-full w-full flex items-center justify-center p-2.5"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.3 }}
                >
                  <StoreImage
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-contain drop-shadow-sm"
                  />
                </motion.div>

                {discount && (
                  <span
                    className="absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 font-label text-[9.5px] font-black text-white"
                    style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)" }}
                  >
                    -{discount}%
                  </span>
                )}
                {product.isNew && (
                  <span
                    className="absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 font-label text-[9px] font-black text-white"
                    style={{ background: "linear-gradient(135deg,#0891b2,#0e7490)" }}
                  >
                    NEW
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col px-2.5 pt-2 pb-2.5">
                <div className="mb-1 line-clamp-2 font-sans text-[11.5px] font-semibold leading-snug text-gray-800">
                  {product.name}
                </div>
                <div className="mb-1">
                  <StarRating rating={product.rating} reviews={product.reviews} />
                </div>
                <div className={`${type.price} text-[14px] font-extrabold text-gray-900`}>
                  {fmt(product.price)}
                </div>
                {product.originalPrice && (
                  <div className="flex items-center gap-1">
                    <span className={`${type.price} text-[10px] text-gray-400 line-through`}>{fmt(product.originalPrice)}</span>
                    {discount && (
                      <span className="font-label text-[9.5px] font-bold text-green-600">{discount}% off</span>
                    )}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
