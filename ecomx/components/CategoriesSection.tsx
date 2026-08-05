"use client";

import { motion } from "framer-motion";
import { useCategories, STORE_CATEGORY_QUERY } from "@/hooks/useCategories";
import { resolveCategoryIcon } from "@/lib/store/category-icons";

interface CategoriesSectionProps {
  onCategoryClick?: (categoryId: string) => void;
  onViewAll?: () => void;
}

export default function CategoriesSection({ onCategoryClick, onViewAll }: CategoriesSectionProps) {
  const { data, isLoading } = useCategories(STORE_CATEGORY_QUERY);
  const categories = data?.categories ?? [];

  return (
    <section className="rounded-2xl border border-gray-100 bg-white px-4 pb-4 shadow-sm sm:px-5 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2 py-3 sm:py-4">
        <div>
          <h2 className="font-display text-[19px] font-extrabold text-gray-900 md:text-[21px]">
            Shop by Category
          </h2>
          <p className="mt-0.5 font-label text-[13px] md:text-[11px] text-gray-500">
            Browse our wide range of product categories
          </p>
        </div>
        <motion.button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1.5 rounded-full border border-gray-800 px-4 py-2 md:py-1.5 font-label text-[13px] md:text-[12px] font-bold text-gray-800 transition-all hover:bg-gray-800 hover:text-white"
          whileTap={{ scale: 0.97 }}
        >
          View All Categories
        </motion.button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 pb-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 pb-4 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-6 lg:pb-5">
          {categories.map((cat, i) => (
            <motion.button
              key={cat._id}
              type="button"
              onClick={() => onCategoryClick?.(cat._id)}
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
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-all group-hover:scale-105 group-hover:text-blue-600">
                <span className="flex h-8 w-8 items-center justify-center [&_svg]:h-8 [&_svg]:w-8">
                  {resolveCategoryIcon(cat.name)}
                </span>
              </div>

              <div>
                <span className="block font-label text-[12px] font-semibold leading-tight text-gray-800 sm:text-[11px]">
                  {cat.name}
                </span>
                {typeof cat.productCount === "number" ? (
                  <span className="mt-0.5 block font-label text-[11px] md:text-[9px] font-medium text-gray-400">
                    {cat.productCount}+ items
                  </span>
                ) : null}
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </section>
  );
}
