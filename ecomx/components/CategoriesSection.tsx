"use client";

import { useCategories, STORE_CATEGORY_QUERY } from "@/hooks/useCategories";
import { SHOP_CATEGORY_BACKGROUND, SHOP_CATEGORY_INK } from "@/lib/store/category-banner-style";
import { Colors } from "@/lib/theme";
import { resolveCategoryIcon } from "@/lib/store/category-icons";
import type { ApiCategory } from "@/types/category.types";

interface CategoriesSectionProps {
  categories?: ApiCategory[];
  isLoading?: boolean;
  onCategoryClick?: (categoryId: string) => void;
  onViewAll?: () => void;
}

export default function CategoriesSection({
  categories: categoriesProp,
  isLoading: isLoadingProp,
  onCategoryClick,
  onViewAll,
}: CategoriesSectionProps) {
  const shouldFetch = categoriesProp === undefined;
  const { data, isLoading: queryLoading } = useCategories(
    STORE_CATEGORY_QUERY,
    shouldFetch
  );
  const categories = categoriesProp ?? data?.categories ?? [];
  const isLoading = isLoadingProp ?? (shouldFetch ? queryLoading : false);

  return (
    <section
      className="rounded-2xl border px-4 pb-4 shadow-sm sm:px-5 md:px-6"
      style={{
        background: SHOP_CATEGORY_BACKGROUND,
        color: SHOP_CATEGORY_INK,
        borderColor: Colors.base_color,
        ["--shop-category" as string]: Colors.base_color,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 py-3 sm:py-4">
        <div>
          <h2 className="font-display text-[19px] font-extrabold md:text-[21px]">
            Shop by Category
          </h2>
          <p className="mt-0.5 font-label text-[13px] opacity-80 md:text-[11px]">
            Browse our wide range of product categories
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/10 px-4 py-2 font-label text-[13px] font-bold transition-all hover:bg-white hover:text-[var(--shop-category)] active:scale-[0.97] md:py-1.5 md:text-[12px]"
        >
          View All Categories
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 pb-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-white/20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 pb-4 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-6 lg:pb-5">
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => onCategoryClick?.(cat._id)}
              className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-white/25 bg-white/15 p-3 text-center transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-white/20 active:scale-[0.98]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 transition-all group-hover:scale-105">
                <span className="flex h-8 w-8 items-center justify-center [&_svg]:h-8 [&_svg]:w-8">
                  {resolveCategoryIcon(cat.name)}
                </span>
              </div>

              <div>
                <span className="block font-label text-[12px] font-semibold leading-tight sm:text-[11px]">
                  {cat.name}
                </span>
                {typeof cat.productCount === "number" ? (
                  <span className="mt-0.5 block font-label text-[11px] font-medium opacity-75 md:text-[9px]">
                    {cat.productCount}+ items
                  </span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
