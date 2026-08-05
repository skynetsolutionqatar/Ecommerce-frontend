"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { tw, type } from "@/lib/theme";
import { formatPrice } from "@/lib/utils";
import { shopUrl } from "@/lib/routes";
import { useProducts } from "@/hooks/useProducts";
import { useCategories, STORE_CATEGORY_QUERY } from "@/hooks/useCategories";
import { useDebounce } from "@/hooks/useDebounce";
import { PRODUCT_STATUS } from "@/lib/Constant";
import { apiProductToStoreProduct } from "@/lib/store/product-mapper";
import StoreImage from "./StoreImage";
import type { Product } from "@/lib/types";
import * as Icons from "./Icons";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onProductSelect?: (product: Product) => void;
}

export default function SearchModal({ open, onClose, onProductSelect }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query.trim(), 300);

  const { data: categoryData } = useCategories(STORE_CATEGORY_QUERY);
  const popularTerms = (categoryData?.categories ?? [])
    .slice(0, 6)
    .map((c) => c.name);

  const { data, isLoading, isFetching } = useProducts(
    {
      status: PRODUCT_STATUS.ACTIVE,
      search: debouncedQuery,
      limit: 8,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    open && debouncedQuery.length >= 2
  );

  const results = data?.products ?? [];
  const showResults = debouncedQuery.length >= 2;

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const goToAllResults = useCallback(() => {
    if (query.trim().length < 2) return;
    onClose();
    router.push(shopUrl({ search: query.trim() }));
  }, [query, onClose, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToAllResults();
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 backdrop-blur-md px-4 pt-20 pb-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${tw.glassCard} w-full max-w-[640px] overflow-hidden rounded-3xl`}
      >
        <form
          className="flex items-center gap-3 border-b border-black/6 px-6 py-5"
          onSubmit={handleSubmit}
        >
          <Icons.Search />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands, SKU..."
            className="flex-1 border-0 bg-transparent text-base text-primary outline-none"
          />
          <button type="button" onClick={onClose} className="border-0 bg-transparent p-1 text-muted cursor-pointer">
            <Icons.X />
          </button>
        </form>

        {showResults ? (
          <div className={`max-h-[400px] overflow-y-auto ${tw.scrollbarThin}`}>
            {isLoading || isFetching ? (
              <div className="p-8 text-center text-sm text-muted">Searching...</div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-muted">
                No results for &ldquo;{debouncedQuery}&rdquo;
              </div>
            ) : (
              results.map((p) => {
                const mapped = apiProductToStoreProduct(p);
                const img = mapped.images[0];
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => onProductSelect?.(mapped)}
                    className="flex w-full gap-4 border-b border-black/5 px-6 py-4 text-left cursor-pointer transition-colors hover:bg-accent-soft/50"
                  >
                    <StoreImage
                      src={img}
                      alt={mapped.name}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover bg-bg-soft"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-semibold text-primary line-clamp-1">
                        {mapped.name}
                      </div>
                      <div className="mt-0.5 text-[13px] text-muted">
                        {[mapped.brand, mapped.category].filter(Boolean).join(" · ")}
                      </div>
                      <div className={`${type.price} mt-1 text-sm font-bold text-accent`}>
                        {formatPrice(mapped.price)}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
            {results.length > 0 ? (
              <button
                type="button"
                onClick={goToAllResults}
                className="w-full border-0 bg-transparent px-6 py-4 text-center text-sm font-semibold text-accent cursor-pointer hover:bg-accent-soft/30"
              >
                View all results for &ldquo;{debouncedQuery}&rdquo; →
              </button>
            ) : null}
          </div>
        ) : null}

        {!showResults ? (
          <div className="px-6 py-5">
            <div className={`mb-4 ${type.eyebrow} text-[13px] md:text-[11px] tracking-[0.12em] text-muted`}>
              {popularTerms.length > 0 ? "Browse Categories" : "Popular Searches"}
            </div>
            <div className="flex flex-wrap gap-2">
              {(popularTerms.length > 0
                ? popularTerms
                : ["POS Systems", "Printers", "Scanners", "Software"]
              ).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="rounded-full border border-border bg-bg px-4 py-2 text-[13px] font-medium text-primary cursor-pointer shadow-[0_2px_8px_color-mix(in_srgb,var(--color-primary)_6%,transparent)] hover:border-accent hover:text-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[13px] md:text-[11px] text-muted">Type at least 2 characters to search</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
