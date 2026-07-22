"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { fmt } from "@/lib/data";
import StoreImage from "./StoreImage";
import * as Icons from "./Icons";
import { type, tw } from "@/lib/theme";
import type { Product } from "@/lib/types";

interface FlipkartProductRowProps {
  title: string;
  subtitle?: string;
  products: Product[];
  onProductClick: (product: Product) => void;
  onViewAll: () => void;
  bgColor?: string;
}

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

export default function FlipkartProductRow({
  title,
  subtitle,
  products,
  onProductClick,
  onViewAll,
  bgColor = "#ffffff",
}: FlipkartProductRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });
  };

  return (
    <section className="mb-4 overflow-hidden rounded-2xl shadow-sm border border-gray-100" style={{ background: bgColor }}>
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5 md:px-6 sm:py-4">
        <div>
          <h2 className="font-display text-[16px] font-extrabold text-gray-900 sm:text-[19px] md:text-[21px]">{title}</h2>
          {subtitle && <p className="mt-0.5 font-label text-[11px] text-gray-500">{subtitle}</p>}
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

      {/* Cards scroll row with nav arrows */}
      <div className="relative">
        {/* Left arrow */}
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-1 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-all hover:border-gray-400 hover:shadow-lg cursor-pointer"
          style={{ marginTop: "-12px" }}
          aria-label="Previous"
        >
          <svg className="h-3.5 w-3.5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Right arrow */}
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-1 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-all hover:border-gray-400 hover:shadow-lg cursor-pointer"
          style={{ marginTop: "-12px" }}
          aria-label="Next"
        >
          <svg className="h-3.5 w-3.5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <div
          ref={scrollRef}
          className={`flex gap-2 overflow-x-auto scroll-smooth ${tw.scrollbarHide} px-4 pb-4 sm:gap-3 sm:px-5 md:px-6 sm:pb-5`}
        >
          {products.map((product, i) => {
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
                  width: "clamp(145px, 21vw, 188px)",
                  background: "#fff",
                  borderRadius: "14px",
                  border: "1.5px solid #f0f0f0",
                  overflow: "hidden",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.055, duration: 0.35 }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 16px 40px rgba(17,24,39,0.14)",
                  borderColor: "#9CA3AF",
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Image */}
                <div
                  className="relative mx-2 mt-2 flex items-center justify-center overflow-hidden"
                  style={{
                    borderRadius: "10px",
                    height: "130px",
                    background: "linear-gradient(135deg, #f8f9fa, #f3f4f6)",
                  }}
                >
                  <motion.div
                    className="h-full w-full flex items-center justify-center p-3"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.35 }}
                  >
                    <StoreImage
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-contain drop-shadow-sm"
                    />
                  </motion.div>

                  {/* Discount badge */}
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
                  <div className={`mb-0.5 ${type.eyebrow} text-[7.5px] tracking-widest text-gray-400 uppercase`}>
                    {product.brand}
                  </div>
                  <div className="mb-1.5 line-clamp-2 font-sans text-[11.5px] font-semibold leading-snug text-gray-800">
                    {product.name}
                  </div>

                  {/* Star Rating */}
                  <div className="mb-1.5">
                    <StarRating rating={product.rating} reviews={product.reviews} />
                  </div>

                  {/* Price */}
                  <div className={`${type.price} text-[13.5px] font-extrabold text-gray-900`}>{fmt(product.price)}</div>
                  {product.originalPrice && (
                    <div className="flex items-center gap-1.5">
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
      </div>
    </section>
  );
}
