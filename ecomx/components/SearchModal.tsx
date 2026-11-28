"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpLeft, ChevronLeft, Clock, Search, X } from "lucide-react";
import StoreImage from "@/components/StoreImage";
import { useDebounce } from "@/hooks/useDebounce";
import { useProducts } from "@/hooks/useProducts";
import { PRODUCT_STATUS } from "@/lib/Constant";
import { shopUrl } from "@/lib/routes";
import { apiProductImage } from "@/lib/store/api-product-display";
import { apiProductToStoreProduct } from "@/lib/store/product-mapper";
import { trackGuestActivityIfAnonymous } from "@/lib/store/guest-activity-helpers";
import { productImageSurfaceClass } from "@/lib/store/product-image-utils";
import {
  addSearchHistory,
  clearSearchHistory,
  loadSearchHistory,
  removeSearchHistoryItem,
  type SearchHistoryEntry,
} from "@/lib/store/search-history";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";
import type { ApiProduct } from "@/types/product.types";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onProductSelect?: (product: Product) => void;
}

const MIN_SUBMIT = 2;

function categoryName(product: ApiProduct): string | undefined {
  const cat = product.categoryId;
  if (cat && typeof cat === "object" && "name" in cat && cat.name) return cat.name;
  return product.brand?.trim() || undefined;
}

function Highlighted({ label, query }: { label: string; query: string }) {
  const idx = query ? label.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (idx < 0) {
    return <span className="line-clamp-2 text-[15px] font-semibold text-gray-800">{label}</span>;
  }
  const end = idx + query.length;
  return (
    <span className="line-clamp-2 text-[15px] text-gray-800">
      {label.slice(0, idx)}
      <span className="font-extrabold text-gray-950">{label.slice(idx, end)}</span>
      {label.slice(end)}
    </span>
  );
}

export default function SearchModal({ open, onClose, onProductSelect }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<SearchHistoryEntry[]>(() => loadSearchHistory());
  const debounced = useDebounce(query.trim(), 280);
  const typing = debounced.length >= 1;

  const { data, isFetching } = useProducts(
    {
      status: PRODUCT_STATUS.ACTIVE,
      search: debounced,
      limit: 8,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    open && typing
  );

  useEffect(() => {
    if (!open) return;
    const frame = window.setTimeout(() => inputRef.current?.focus(), 50);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(frame);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !debounced) return;
    trackGuestActivityIfAnonymous({
      eventType: "product_search",
      metadata: { searchQuery: debounced },
    });
  }, [debounced, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const rows = useMemo(() => {
    if (!typing) return history.map((entry) => ({ kind: "history" as const, entry }));
    const q = debounced.toLowerCase();
    const terms = history
      .filter((entry) => entry.query.toLowerCase().includes(q))
      .slice(0, 3)
      .map((entry) => ({ kind: "term" as const, label: entry.query }));
    const products = (data?.products ?? []).map((product) => ({ kind: "product" as const, product }));
    return [...terms, ...products];
  }, [data?.products, debounced, history, typing]);

  const commit = useCallback(
    (raw: string, meta?: Pick<SearchHistoryEntry, "categoryLabel" | "categoryId">) => {
      const term = raw.trim();
      if (term.length < MIN_SUBMIT) return;
      setHistory(addSearchHistory(term, meta));
      onClose();
      router.push(shopUrl({ search: term, listing: true, categoryId: meta?.categoryId }));
    },
    [onClose, router]
  );

  const openProduct = useCallback(
    (product: ApiProduct) => {
      if (debounced.length >= MIN_SUBMIT) {
        setHistory(addSearchHistory(debounced, { categoryLabel: categoryName(product) }));
      }
      onProductSelect?.(apiProductToStoreProduct(product));
    },
    [debounced, onProductSelect]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-center bg-[#f1f3f6]">
      <div className="flex h-full w-full max-w-3xl flex-col bg-[#f1f3f6]">
        <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 pb-3 pt-[max(10px,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-gray-900"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2.2} />
          </button>
          <div className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4">
            <Search className="h-5 w-5 shrink-0 text-gray-400" strokeWidth={2} />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commit(query);
                }
              }}
              placeholder="Search labels, printers, POS"
              aria-label="Search products"
              className="min-w-0 flex-1 border-0 bg-transparent text-[15px] font-medium text-gray-900 outline-none placeholder:text-gray-400"
            />
            {query.length > 0 ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-gray-100 text-gray-500"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pb-8">
          {!typing && history.length > 0 ? (
            <div className="flex items-center justify-between px-4 pb-1 pt-4">
              <h2 className="text-base font-extrabold text-gray-900">Recent searches</h2>
              <button
                type="button"
                onClick={() => setHistory(clearSearchHistory())}
                className="border-0 bg-transparent px-1 text-[13px] font-bold text-[#0a255d]"
              >
                Clear all
              </button>
            </div>
          ) : null}

          {typing && isFetching && rows.length === 0 ? (
            <div className="flex flex-col gap-3 px-4 pt-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-12 w-12 animate-pulse rounded-md bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-4/5 animate-pulse rounded bg-gray-200" />
                    <div className="h-2.5 w-2/5 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="px-8 pt-12 text-center">
              <p className="text-base font-extrabold text-gray-900">
                {typing ? `No products match “${debounced}”` : "Search the store"}
              </p>
              <p className="mt-1.5 text-sm text-gray-500">
                {typing
                  ? "Check the spelling, or search for a brand or category."
                  : "Find labels, printers, scanners, POS systems and more."}
              </p>
            </div>
          ) : (
            rows.map((row, index) => {
              const divider = index > 0 ? "border-t border-gray-200" : "";
              if (row.kind === "product") {
                const product = row.product;
                const sub = categoryName(product);
                const image = apiProductImage(product);
                return (
                  <button
                    key={product._id}
                    type="button"
                    onClick={() => openProduct(product)}
                    className={`flex min-h-16 w-full items-center gap-3 bg-transparent px-4 py-2.5 text-left ${divider}`}
                  >
                    <span className={`h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-200 p-1 ${productImageSurfaceClass}`}>
                      {image ? <StoreImage src={image} alt="" className="h-full w-full object-contain" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <Highlighted label={product.name} query={debounced} />
                      <span className="mt-0.5 block truncate text-xs text-gray-500">
                        {[sub ? `in ${sub}` : null, formatPrice(product.price)].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </button>
                );
              }

              const label = row.kind === "history" ? row.entry.query : row.label;
              const sub = row.kind === "history" ? row.entry.categoryLabel : undefined;
              return (
                <div key={`${row.kind}-${label}`} className={`flex min-h-14 items-center bg-white ${divider}`}>
                  <button
                    type="button"
                    onClick={() => commit(label, row.kind === "history" ? row.entry : undefined)}
                    className="flex min-h-14 min-w-0 flex-1 items-center gap-3 border-0 bg-transparent py-2 ps-4 text-left"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                      {row.kind === "history" ? <Clock className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <Highlighted label={label} query={debounced} />
                      {sub ? <span className="mt-0.5 block truncate text-xs font-semibold text-[#0a255d]">{sub}</span> : null}
                    </span>
                  </button>
                  {row.kind === "history" ? (
                    <button
                      type="button"
                      onClick={() => setHistory(removeSearchHistoryItem(label))}
                      className="flex h-11 w-11 items-center justify-center border-0 bg-transparent text-gray-400"
                      aria-label={`Remove ${label} from recent searches`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setQuery(label)}
                    className="me-1 flex h-11 w-11 items-center justify-center border-0 bg-transparent text-gray-400"
                    aria-label={`Edit search, ${label}`}
                  >
                    <ArrowUpLeft className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
