"use client";
import { motion } from "framer-motion";
import { CATEGORIES, getCategoryDisplayCount } from "@/lib/data";

interface CategoriesSectionProps {
  onCategoryClick?: (category: string) => void;
  onViewAll?: () => void;
}

// Map each category to its beautiful product image
const CAT_IMAGES: Record<string, string> = {
  "CCTV & Security": "/images/categories/cat-cctv.png",
  "Security & CCTV": "/images/categories/cat-cctv.png",
  "Networking": "/images/categories/cat-networking.png",
  "POS Systems": "/images/categories/cat-pos.png",
  "Computers": "/images/categories/cat-computers.png",
  "Laptops & PCs": "/images/categories/cat-computers.png",
  "Printers": "/images/categories/cat-printers.png",
  "Scanners": "/images/categories/cat-scanners.png",
  "Software & ERP": "/images/categories/cat-software.png",
  "Displays": "/images/categories/cat-displays.png",
  "Servers & Storage": "/images/categories/cat-servers.png",
  "UPS & Power": "/images/categories/cat-ups.png",
  "Access Control": "/images/categories/cat-access.png",
  "Mobile Computers": "/images/categories/cat-mobile.png",
  "Label Printers": "/images/categories/cat-printers.png",
};

const FALLBACK_IMAGE = "/images/categories/cat-pos.png";

export default function CategoriesSection({ onCategoryClick, onViewAll }: CategoriesSectionProps) {
  return (
    <section className="bg-white pb-4 px-4 sm:px-5 md:px-6 rounded-2xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-3 sm:py-4">
        <div>
          <h2 className="font-display text-[19px] font-extrabold text-gray-900 md:text-[21px]">Shop by Category</h2>
          <p className="mt-0.5 font-label text-[11px] text-gray-500">Browse our wide range of product categories</p>
        </div>
        <motion.button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1.5 rounded-full border border-gray-800 px-4 py-1.5 font-label text-[12px] font-bold text-gray-800 transition-all hover:bg-gray-800 hover:text-white"
          whileTap={{ scale: 0.97 }}
        >
          View All Categories
        </motion.button>
      </div>

      {/* Category grid — 6 cols × 2 rows with beautiful product images */}
      <div className="grid grid-cols-3 gap-2 pb-4 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6 lg:pb-5">
        {CATEGORIES.map((cat, i) => {
          const count = getCategoryDisplayCount(cat);
          const img = CAT_IMAGES[cat.name] ?? FALLBACK_IMAGE;

          return (
            <motion.button
              key={cat.name}
              type="button"
              onClick={() => onCategoryClick?.(cat.shopCategory ?? cat.name)}
              className="group flex flex-col items-center gap-2 rounded-xl bg-white p-3 text-center cursor-pointer"
              style={{
                border: "1.5px solid #f0f0f0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              whileHover={{
                y: -3,
                boxShadow: "0 8px 24px rgba(17,24,39,0.10)",
                borderColor: "#CBD5E1",
              }}
              whileTap={{ scale: 0.96 }}
            >
              {/* Image container — rounded square with product photo */}
              <div
                className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl p-1.5 transition-all group-hover:scale-105"
                style={{ background: "#f8fafc" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={cat.name}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                />
              </div>

              <div>
                <span className="block font-label text-[10.5px] font-semibold leading-tight text-gray-800 sm:text-[11px]">
                  {cat.name}
                </span>
                <span className="mt-0.5 block font-label text-[9px] text-gray-400 font-medium">
                  {count}+ items
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
