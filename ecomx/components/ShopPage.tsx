"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCTS, PRICE_MAX, fmt } from "@/lib/data";
import type { FilterState, SortOption, WishlistItem, Product } from "@/lib/types";
import FilterSidebar from "./FilterSidebar";
import ProductCard from "./ProductCard";
import * as Icons from "./Icons";
import { tw } from "@/lib/theme";

/* ─── Constants ──────────────────────────────────────────────── */
const DEFAULT_FILTERS: FilterState = {
  categories: [],
  priceRange: [0, PRICE_MAX],
  ratings: [],
  colors: [],
  sizes: [],
  tags: [],
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "New Arrivals" },
  { value: "bestseller", label: "Best Sellers" },
];

const ITEMS_PER_PAGE = 12;

/* ─── Types ──────────────────────────────────────────────────── */
interface ShopPageProps {
  onAddToCart: (product: Product, color: string, size: string) => void;
  onWishlistToggle: (item: WishlistItem) => void;
  wishlist: WishlistItem[];
  onProductClick: (product: Product) => void;
  initialCategory?: string;
  onHomeClick?: () => void;
}

/* ═══════════════════════════════════════════════════════════════
   SHOP PAGE
═══════════════════════════════════════════════════════════════ */
export default function ShopPage({
  onAddToCart, onWishlistToggle, wishlist,
  onProductClick, initialCategory, onHomeClick,
}: ShopPageProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    categories: initialCategory ? [initialCategory] : [],
  });
  const [sort, setSort] = useState<SortOption>("relevance");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  /* Sync category from parent navigation */
  useEffect(() => {
    if (initialCategory) setFilters(f => ({ ...f, categories: [initialCategory] }));
  }, [initialCategory]);

  /* Scroll to top on mount */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  /* Reset page when filters change */
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sort]);

  /* ── Filtering + Sorting ── */
  const filtered = useMemo(() => {
    let list = [...PRODUCTS];
    if (filters.categories.length)
      list = list.filter(p => p.category && filters.categories.includes(p.category));
    list = list.filter(
      p => p.price >= filters.priceRange[0] &&
        p.price <= (filters.priceRange[1] >= PRICE_MAX ? Infinity : filters.priceRange[1])
    );
    if (filters.ratings.length) {
      const min = Math.min(...filters.ratings.map(Number));
      list = list.filter(p => p.rating >= min);
    }
    if (filters.colors.length)
      list = list.filter(p => filters.colors.some(c => p.colors.some(pc => pc.name.toLowerCase().includes(c.toLowerCase()))));
    if (filters.sizes.length)
      list = list.filter(p => filters.sizes.some(s => p.sizes.includes(s)));
    if (filters.tags.length)
      list = list.filter(p => filters.tags.some(t => p.tags.includes(t) || p.brand.toLowerCase().includes(t.toLowerCase())));

    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      case "newest": list = [...list.filter(p => p.isNew), ...list.filter(p => !p.isNew)]; break;
      case "bestseller": list = [...list.filter(p => p.isBestSeller), ...list.filter(p => !p.isBestSeller)]; break;
    }
    return list;
  }, [filters, sort]);

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  /* Pagination */
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const pageTitle = filters.categories.length === 1
    ? filters.categories[0]
    : filters.categories.length > 1 ? "Filtered Results" : "All Products";

  return (
    <div
      className={`${tw.pageTopOffset} min-h-screen`}
      style={{ background: "#f3f4f6" }}
    >
      {/* ────────────────────────────────────────────────────
          MAIN CONTENT — Sidebar + Products
      ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1440px] px-3 sm:px-5 md:px-8 lg:px-[50px] py-3 sm:py-4">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-[11.5px] text-gray-500 mb-4">
          <button
            type="button"
            onClick={onHomeClick}
            className="border-0 bg-transparent p-0 text-gray-600 hover:text-blue-600 cursor-pointer"
          >
            Home
          </button>
          <span className="text-gray-400 mx-0.5">›</span>
          <span className="font-medium text-gray-700">All Products</span>
        </nav>

        <div className="flex items-start gap-5">

          {/* ── Sidebar ── */}
          <aside
            className="hidden w-[200px] shrink-0 lg:block"
            style={{ position: "sticky", top: "calc(var(--header-height, 120px) + 20px)", maxHeight: "calc(100vh - var(--header-height, 120px) - 40px)", overflowY: "auto" }}
          >
            <div className="overflow-hidden rounded-lg bg-white" style={{ border: "1px solid #e5e7eb" }}>
              <FilterSidebar
                filters={filters}
                onChange={setFilters}
                onClear={clearFilters}
                resultCount={filtered.length}
              />
            </div>
          </aside>

          {/* ── Products ── */}
          <main className="min-w-0 flex-1">
            {/* Section title + Sort controls */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-[22px] font-bold text-gray-900">
                  {pageTitle}
                </h1>
                <p className="mt-0.5 text-[12px] text-gray-500">
                  {filtered.length} products found
                </p>
              </div>

              {/* Right controls */}
              <div className="flex shrink-0 items-center gap-2">
                {/* Sort */}
                <div className="relative hidden sm:flex items-center gap-2">
                  <span className="text-[12px] text-gray-500 whitespace-nowrap">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={e => setSort(e.target.value as SortOption)}
                      className="h-9 cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-[12px] font-medium text-gray-700 shadow-sm outline-none transition hover:border-gray-400"
                    >
                      {SORT_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]">▾</span>
                  </div>
                </div>

                {/* Grid / List toggle */}
                <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    className={`flex h-9 w-9 items-center justify-center transition-colors ${view === "grid" ? "bg-[#0a255dff] text-white" : "text-gray-400 hover:bg-gray-50"}`}
                    title="Grid view"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className={`flex h-9 w-9 items-center justify-center transition-colors ${view === "list" ? "bg-[#0a255dff] text-white" : "text-gray-400 hover:bg-gray-50"}`}
                    title="List view"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Mobile filter button */}
                <motion.button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="flex h-9 items-center gap-1.5 rounded-lg bg-gray-900 px-4 text-[12px] font-bold text-white md:hidden"
                  whileTap={{ scale: 0.95 }}
                >
                  <Icons.SlidersH />
                  Filters
                </motion.button>
              </div>
            </div>

            {/* Products grid / list / empty */}
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center rounded-2xl bg-white py-24 text-center shadow-sm"
                style={{ border: "1px solid #eee" }}
              >
                <div className="mb-4 text-6xl">🔍</div>
                <div className="mb-2 font-display text-xl font-bold text-gray-800">No products found</div>
                <div className="mb-6 text-sm text-gray-500">Try adjusting your filters</div>
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
            ) : view === "list" ? (
              /* ── LIST VIEW ── */
              <div className="flex flex-col gap-3">
                {paginated.map((product, i) => {
                  const disc = product.originalPrice
                    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                    : null;
                  return (
                    <motion.div
                      key={product.id}
                      className="flex gap-4 rounded-xl bg-white p-4"
                      style={{ border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025, duration: 0.3 }}
                      whileHover={{ boxShadow: "0 4px 20px rgba(17,24,39,0.10)" }}
                    >
                      <motion.div
                        className="flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gray-50 p-2"
                        onClick={() => onProductClick(product)}
                        whileHover={{ scale: 1.04 }}
                      >
                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-contain" />
                      </motion.div>

                      <div className="flex flex-1 min-w-0 flex-col justify-between">
                        <div className="cursor-pointer" onClick={() => onProductClick(product)}>
                          <div className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">{product.brand}</div>
                          <div className="mb-1.5 line-clamp-2 text-[14px] font-semibold leading-snug text-gray-900">
                            {product.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                              style={{ background: "#111827" }}
                            >
                              {product.rating} ★
                            </span>
                            <span className="text-[11px] text-gray-400">({product.reviews?.toLocaleString()})</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-[18px] font-extrabold text-gray-900">{fmt(product.price)}</span>
                            {product.originalPrice && (
                              <span className="text-[12px] text-gray-400 line-through">{fmt(product.originalPrice)}</span>
                            )}
                            {disc && (
                              <span className="text-[11px] font-bold text-gray-600">{disc}% off</span>
                            )}
                          </div>
                          <motion.button
                            type="button"
                            onClick={() => onAddToCart(product, product.colors[0]?.name || "", product.sizes[0] || "")}
                            className="flex items-center gap-1.5 rounded px-5 py-2 text-[12px] font-bold text-white"
                            style={{ background: "#1e3a8a" }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                          >
                            + Add to Cart
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* ── GRID VIEW ── */
              <motion.div
                className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {paginated.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onWishlistToggle={onWishlistToggle}
                    isWishlisted={wishlist.some(w => w.id === product.id)}
                    onClick={onProductClick}
                  />
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  {/* Prev */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-[12px] font-medium text-gray-600 disabled:opacity-40 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    ‹ Prev
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border text-[12px] font-medium cursor-pointer transition-colors ${currentPage === page
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {totalPages > 5 && (
                    <>
                      <span className="text-gray-400 px-1">...</span>
                      <button
                        type="button"
                        onClick={() => setCurrentPage(totalPages)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border text-[12px] font-medium cursor-pointer transition-colors ${currentPage === totalPages
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  {/* Next */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-[12px] font-medium text-gray-600 disabled:opacity-40 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    Next ›
                  </button>
                </div>

                {/* Per page selector */}
                <div className="hidden sm:flex items-center gap-2 text-[12px] text-gray-500">
                  <span>Show:</span>
                  <div className="relative">
                    <select
                      className="h-9 appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-7 text-[12px] font-medium text-gray-700 outline-none cursor-pointer"
                      defaultValue="12"
                    >
                      <option value="12">12 per page</option>
                      <option value="24">24 per page</option>
                      <option value="48">48 per page</option>
                    </select>
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]">▾</span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────
          MOBILE FILTER DRAWER
      ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[310] flex max-h-[88vh] flex-col overflow-hidden rounded-t-3xl bg-white"
              style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.18)" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="h-1 w-10 rounded-full bg-gray-200" />
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 px-5 pb-3">
                <span className="font-display text-[16px] font-bold text-gray-900">Filters</span>
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icons.X />
                  </motion.button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <FilterSidebar
                  filters={filters}
                  onChange={setFilters}
                  onClear={clearFilters}
                  resultCount={filtered.length}
                  mobile
                />
              </div>

              <div className="border-t border-gray-100 bg-white px-5 py-4">
                <motion.button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full rounded-xl py-3.5 text-[14px] font-bold text-white"
                  style={{ background: "#1d4ed8" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Show {filtered.length} Results
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
