"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FilterSidebar from "./FilterSidebar";
import StoreProductCard, { type ShopViewMode } from "./store/StoreProductCard";
import * as Icons from "./Icons";
import { tw, Colors } from "@/lib/theme";
import { useProducts } from "@/hooks/useProducts";
import { useCategories, STORE_CATEGORY_QUERY } from "@/hooks/useCategories";
import { useDebounce } from "@/hooks/useDebounce";
import { useShopFilterMeta } from "@/hooks/useShopFilterMeta";
import { PRODUCT_STATUS } from "@/lib/Constant";
import {
  createDefaultFilters,
  filtersToProductQuery,
  FALLBACK_PRICE_MAX,
} from "@/lib/store/shop-filters";
import { apiProductToStoreProduct } from "@/lib/store/product-mapper";
import { apiProductToWishlistItem } from "@/lib/store/wishlist-helpers";
import type { FilterState, SortOption, WishlistItem, Product } from "@/lib/types";
import type { ApiProduct } from "@/types/product.types";

const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "New Arrivals" },
  { value: "bestseller", label: "Best Sellers" },
];

interface ShopPageProps {
  onAddToCart: (product: Product, color: string, size: string) => void;
  onBuyNow: (product: Product, color: string, size: string) => void;
  onWishlistToggle: (item: WishlistItem) => void;
  isWishlisted: (productId: string) => boolean;
  onProductClick: (product: Product) => void;
  initialCategory?: string;
  initialSearch?: string;
  onHomeClick?: () => void;
}

function sortToQuery(sort: SortOption) {
  switch (sort) {
    case "price-asc":
      return { sortBy: "price" as const, sortOrder: "asc" as const };
    case "price-desc":
      return { sortBy: "price" as const, sortOrder: "desc" as const };
    case "rating":
      return { sortBy: "averageRating" as const, sortOrder: "desc" as const };
    case "newest":
      return { sortBy: "createdAt" as const, sortOrder: "desc" as const, isNew: true };
    case "bestseller":
      return { sortBy: "totalSold" as const, sortOrder: "desc" as const, isBestSeller: true };
    default:
      return { sortBy: "createdAt" as const, sortOrder: "desc" as const };
  }
}

export default function ShopPage({
  onAddToCart,
  onBuyNow,
  onWishlistToggle,
  isWishlisted,
  onProductClick,
  initialCategory,
  initialSearch,
  onHomeClick,
}: ShopPageProps) {
  const { priceMax, brands } = useShopFilterMeta();
  const [filters, setFilters] = useState<FilterState>(() => createDefaultFilters());
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(() => createDefaultFilters());
  const [sort, setSort] = useState<SortOption>("relevance");
  const [search, setSearch] = useState(initialSearch ?? "");
  const [viewMode, setViewMode] = useState<ShopViewMode>("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(search);
  const debouncedPriceRange = useDebounce(appliedFilters.priceRange, 400);

  const { data: categoryData } = useCategories(STORE_CATEGORY_QUERY);
  const categories = categoryData?.categories ?? [];
  const sortQuery = sortToQuery(sort);

  const filterQuery = useMemo(
    () =>
      filtersToProductQuery(
        { ...appliedFilters, priceRange: debouncedPriceRange },
        priceMax
      ),
    [appliedFilters, debouncedPriceRange, priceMax]
  );

  const { data, isLoading, isError } = useProducts({
    status: PRODUCT_STATUS.ACTIVE,
    search: debouncedSearch || undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    ...sortQuery,
    ...filterQuery,
  });

  const products = data?.products ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? products.length;
  const selectedCategoryId = appliedFilters.categories[0];

  useEffect(() => {
    const syncMax = (f: FilterState) => {
      if (f.priceRange[1] === FALLBACK_PRICE_MAX || f.priceRange[1] > priceMax) {
        return { ...f, priceRange: [f.priceRange[0], priceMax] as [number, number] };
      }
      return f;
    };
    setFilters(syncMax);
    setAppliedFilters(syncMax);
  }, [priceMax]);

  useEffect(() => {
    if (initialCategory) {
      const next = { ...createDefaultFilters(priceMax), categories: [initialCategory] };
      setFilters(next);
      setAppliedFilters(next);
      setCurrentPage(1);
    }
  }, [initialCategory, priceMax]);

  useEffect(() => {
    if (initialSearch != null) setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters, debouncedPriceRange, sort, debouncedSearch]);

  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  }, [filters]);

  const clearFilters = useCallback(() => {
    const defaults = createDefaultFilters(priceMax);
    setFilters(defaults);
    setAppliedFilters(defaults);
  }, [priceMax]);

  const handleFilterChange = useCallback(
    (next: FilterState) => {
      setFilters(next);
      const instantKeys: (keyof FilterState)[] = [
        "categories",
        "brands",
        "inStock",
        "hasDiscount",
        "minRating",
      ];
      const isInstant = instantKeys.some((key) => {
        if (key === "categories" || key === "brands") {
          return JSON.stringify(next[key]) !== JSON.stringify(appliedFilters[key]);
        }
        return next[key] !== appliedFilters[key];
      });
      if (isInstant) {
        setAppliedFilters(next);
        setCurrentPage(1);
      }
    },
    [appliedFilters]
  );

  const handleProductClick = (apiProduct: ApiProduct) => {
    onProductClick(apiProductToStoreProduct(apiProduct));
  };

  const handleAddToCart = (apiProduct: ApiProduct) => {
    const mapped = apiProductToStoreProduct(apiProduct);
    onAddToCart(mapped, mapped.colors[0]?.name ?? "", mapped.sizes[0] ?? "");
  };

  const handleBuyNow = (apiProduct: ApiProduct) => {
    const mapped = apiProductToStoreProduct(apiProduct);
    onBuyNow(mapped, mapped.colors[0]?.name ?? "", mapped.sizes[0] ?? "");
  };

  const handleWishlistToggle = (apiProduct: ApiProduct) => {
    onWishlistToggle(apiProductToWishlistItem(apiProduct));
  };

  const pageTitle = useMemo(() => {
    if (selectedCategoryId) {
      const cat = categories.find((c) => c._id === selectedCategoryId);
      return cat?.name ?? "Products";
    }
    return "All Products";
  }, [selectedCategoryId, categories]);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ id: c._id, name: c.name, count: c.productCount })),
    [categories]
  );

  return (
    <div className={`${tw.pageTopOffset} min-h-screen`} style={{ background: "#f3f4f6" }}>
      <div className="mx-auto max-w-[1440px] px-3 sm:px-5 md:px-8 lg:px-[50px] py-3 sm:py-4">
        <nav className="mb-4 flex items-center gap-1 text-[11.5px] text-gray-500">
          <button
            type="button"
            onClick={onHomeClick}
            className="border-0 bg-transparent p-0 text-gray-600 hover:text-blue-600 cursor-pointer"
          >
            Home
          </button>
          <span className="text-gray-400 mx-0.5">›</span>
          <span className="font-medium text-gray-700">{pageTitle}</span>
        </nav>

        <div className="flex items-start gap-5">
          <aside
            className="hidden w-[220px] shrink-0 lg:block"
            style={{
              position: "sticky",
              top: "calc(var(--header-height, 120px) + 20px)",
              maxHeight: "calc(100vh - var(--header-height, 120px) - 40px)",
              overflowY: "auto",
            }}
          >
            <div className="overflow-hidden rounded-lg bg-white" style={{ border: "1px solid #e5e7eb" }}>
              <FilterSidebar
                filters={filters}
                onChange={handleFilterChange}
                onClear={clearFilters}
                onApply={applyFilters}
                resultCount={total}
                isLoading={isLoading}
                priceMax={priceMax}
                categories={categoryOptions}
                brands={brands}
              />
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-[22px] font-bold text-gray-900">{pageTitle}</h1>
                <p className="mt-0.5 text-[12px] text-gray-500">
                  {isLoading ? "Loading..." : `${total} products found`}
                </p>
              </div>

              <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
                <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    className={`flex h-9 w-9 items-center justify-center border-0 cursor-pointer transition ${
                      viewMode === "grid" ? "text-white" : "bg-white text-gray-500 hover:text-gray-800"
                    }`}
                    style={viewMode === "grid" ? { background: Colors.base_color } : undefined}
                  >
                    <Icons.Grid />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                    className={`flex h-9 w-9 items-center justify-center border-0 cursor-pointer transition ${
                      viewMode === "list" ? "text-white" : "bg-white text-gray-500 hover:text-gray-800"
                    }`}
                    style={viewMode === "list" ? { background: Colors.base_color } : undefined}
                  >
                    <Icons.List />
                  </button>
                </div>

                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="hidden h-9 w-48 rounded-lg border border-gray-200 bg-white px-3 text-[12px] outline-none focus:border-blue-400 sm:block"
                />

                <div className="relative hidden sm:flex items-center gap-2">
                  <span className="text-[12px] text-gray-500 whitespace-nowrap">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortOption)}
                      className="h-9 cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-[12px] font-medium text-gray-700 shadow-sm outline-none transition hover:border-gray-400"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]">
                      ▾
                    </span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-[12px] font-bold text-white lg:hidden"
                  style={{ background: Colors.base_color }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icons.SlidersH />
                  Filters
                </motion.button>
              </div>
            </div>

            {isError ? (
              <div className="rounded-2xl bg-white py-20 text-center text-sm text-red-500">
                Failed to load products. Please try again.
              </div>
            ) : isLoading && products.length === 0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-72 animate-pulse rounded-xl bg-white" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center rounded-2xl bg-white py-24 text-center shadow-sm"
                style={{ border: "1px solid #eee" }}
              >
                <div className="mb-4 text-6xl">🔍</div>
                <div className="mb-2 font-display text-xl font-bold text-gray-800">No products found</div>
                <div className="mb-6 text-sm text-gray-500">Try adjusting your filters or search</div>
                <motion.button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl bg-gray-900 px-8 py-3 font-label text-sm font-bold text-white"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Clear all filters
                </motion.button>
              </motion.div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"
                    : "flex flex-col gap-3"
                }
              >
                {products.map((product, index) => (
                  <StoreProductCard
                    key={product._id}
                    product={product}
                    index={index}
                    variant={viewMode}
                    onClick={handleProductClick}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onWishlistToggle={handleWishlistToggle}
                    isWishlisted={isWishlisted(product._id)}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-[12px] font-medium text-gray-600 disabled:opacity-40 cursor-pointer hover:bg-gray-50"
                >
                  ‹ Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-[12px] font-medium cursor-pointer ${
                        currentPage === pageNum
                          ? "border-transparent text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                      style={
                        currentPage === pageNum ? { background: Colors.base_color } : undefined
                      }
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-[12px] font-medium text-gray-600 disabled:opacity-40 cursor-pointer hover:bg-gray-50"
                >
                  Next ›
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[310] flex max-h-[88vh] flex-col overflow-hidden rounded-t-3xl bg-white"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-5 pb-3 pt-4">
                <span className="font-display text-[16px] font-bold text-gray-900">Filters</span>
                <button type="button" onClick={() => setMobileFilterOpen(false)} className="text-gray-500">
                  <Icons.X />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <FilterSidebar
                  filters={filters}
                  onChange={handleFilterChange}
                  onClear={clearFilters}
                  onApply={() => {
                    applyFilters();
                    setMobileFilterOpen(false);
                  }}
                  resultCount={total}
                  isLoading={isLoading}
                  priceMax={priceMax}
                  categories={categoryOptions}
                  brands={brands}
                  mobile
                />
              </div>
              <div className="border-t border-gray-100 px-5 py-4">
                <button
                  type="button"
                  onClick={() => {
                    applyFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="w-full rounded-xl py-3.5 text-[14px] font-bold text-white"
                  style={{ background: Colors.base_color }}
                >
                  Show {total} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
