"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpLeft, ChevronLeft, Clock, Search, X } from "lucide-react";
import StoreImage from "@/components/StoreImage";
import { useDebounce } from "@/hooks/useDebounce";
import { useProducts } from "@/hooks/useProducts";
import { PRODUCT_STATUS } from "@/lib/Constant";
import { trackGuestActivityIfAnonymous } from "@/lib/store/guest-activity-helpers";
import { apiProductImage } from "@/lib/store/api-product-display";
import { productImageSurfaceClass } from "@/lib/store/product-image-utils";
import { apiProductToStoreProduct } from "@/lib/store/product-mapper";
import { ROUTES, shopUrl } from "@/lib/routes";
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

const DEBOUNCE_MS = 280;
const MIN_SUBMIT = 2;

type Row =
  | { kind: "history"; entry: SearchHistoryEntry }
  | { kind: "term"; label: string }
  | { kind: "product"; product: ApiProduct };

function categoryName(product: ApiProduct): string | undefined {
  const cat = product.categoryId;
  return cat && typeof cat === "object" && "name" in cat ? cat.name : product.brand?.trim() || undefined;
}

function HighlightedLabel({ label, query }: { label: string; query: string }) {
  const idx = query ? label.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (idx < 0) {
    return <span className="text-[15px] font-semibold text-gray-700">{label}</span>;
  }
  const end = idx + query.length;
  return (
    <span className="text-[15px] text-gray-700">
      {label.slice(0, idx)}
      <span className="font-extrabold text-gray-900">{label.slice(idx, end)}</span>
      {label.slice(end)}
    </span>
  );
}

function SuggestionSkeleton() {
  return (
    <div className="space-y-3 px-4 pt-3">
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
  );
}

export default function MobileSearchScreen({
  onClose,
  onProductSelect,
  categoryId,
  initialQuery = "",
}: {
  onClose: () => void;
  onProductSelect?: (product: Product) => void;
  categoryId?: string;
  initialQuery?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const debounced = useDebounce(query.trim(), DEBOUNCE_MS);
  const [history, setHistory] = useState<SearchHistoryEntry[]>(() => loadSearchHistory());

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    if (!debounced) return;
    trackGuestActivityIfAnonymous({
      eventType: "product_search",
      metadata: { searchQuery: debounced },
    });
  }, [debounced]);

  const typing = debounced.length >= 1;
  const { data, isFetching } = useProducts(
    {
      status: PRODUCT_STATUS.ACTIVE,
      search: debounced,
      limit: 8,
      sortBy: "createdAt",
      sortOrder: "desc",
      ...(categoryId ? { categoryId } : {}),
    },
    typing
  );

  const rows: Row[] = useMemo(() => {
    if (!typing) return history.map((entry) => ({ kind: "history" as const, entry }));
    const q = debounced.toLowerCase();
    const terms = history
      .filter((h) => h.query.toLowerCase().includes(q))
      .slice(0, 3)
      .map((h) => ({ kind: "term" as const, label: h.query }));
    const products = (data?.products ?? []).map((product) => ({ kind: "product" as const, product }));
    return [...terms, ...products];
  }, [typing, debounced, history, data?.products]);

  const commit = useCallback(
    (raw: string, meta?: Pick<SearchHistoryEntry, "categoryLabel" | "categoryId">) => {
      const term = raw.trim();
      if (term.length < MIN_SUBMIT) return;
      setHistory(addSearchHistory(term, meta));
      onClose();
      router.push(
        shopUrl({
          search: term,
          listing: true,
          categoryId: categoryId ?? meta?.categoryId,
        })
      );
    },
    [categoryId, onClose, router]
  );

  const openProduct = useCallback(
    (product: ApiProduct) => {
      if (debounced.length >= MIN_SUBMIT) {
        setHistory(
          addSearchHistory(debounced, { categoryLabel: categoryName(product) })
        );
      }
      onClose();
      const mapped = apiProductToStoreProduct(product);
      if (onProductSelect) {
        onProductSelect(mapped);
      } else {
        router.push(ROUTES.product(product.slug));
      }
    },
    [debounced, onClose, onProductSelect, router]
  );

  const removeEntry = useCallback((entry: SearchHistoryEntry) => {
    setHistory(removeSearchHistoryItem(entry.query));
  }, []);

  const clearAll = useCallback(() => {
    clearSearchHistory();
    setHistory([]);
  }, []);

  return (
    <div className="mobile-search-screen fixed inset-0 z-[300] flex flex-col bg-[#f1f3f6] md:hidden">
      <header className="flex items-center gap-2 border-b border-gray-200 bg-white px-2 pb-3 pt-[max(8px,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 bg-transparent"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2.2} />
        </button>
        <div className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white ps-3 pe-1.5">
          <Search className="h-5 w-5 shrink-0 text-gray-400" strokeWidth={2} aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit(query);
            }}
            placeholder="Search labels, printers, POS"
            autoCapitalize="off"
            autoCorrect="off"
            enterKeyHint="search"
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] font-medium text-gray-900 outline-none"
            aria-label="Search products"
          />
          {query.length > 0 ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-gray-100 text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          ) : null}
        </div>
      </header>

      {!typing && history.length > 0 ? (
        <div className="flex items-center justify-between bg-[#f1f3f6] px-4 pb-1 pt-4">
          <h2 className="text-base font-extrabold text-gray-900">Recent searches</h2>
          <button
            type="button"
            onClick={clearAll}
            className="min-h-11 border-0 bg-transparent px-1 text-[13px] font-bold text-[#0a255d]"
          >
            Clear all
          </button>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(24px,env(safe-area-inset-bottom))]">
        {typing && isFetching && rows.length === 0 ? (
          <SuggestionSkeleton />
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 px-8 pt-12 text-center">
            <p className="text-base font-extrabold text-gray-900">
              {typing ? `No products match “${debounced}”` : "Search the store"}
            </p>
            <p className="text-sm text-gray-500">
              {typing
                ? "Check the spelling, or search for a brand or category."
                : "Find labels, printers, scanners, POS systems and more."}
            </p>
          </div>
        ) : (
          <ul className="bg-white">
            {rows.map((item, index) => {
              const divider = index > 0 ? "border-t border-gray-100" : "";

              if (item.kind === "product") {
                const { product } = item;
                const sub = categoryName(product);
                const img = apiProductImage(product);
                return (
                  <li key={`p-${product._id}`} className={divider}>
                    <button
                      type="button"
                      onClick={() => openProduct(product)}
                      className="flex min-h-16 w-full items-center gap-3 px-4 py-2.5 text-left"
                    >
                      <div
                        className={`h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-100 ${productImageSurfaceClass}`}
                      >
                        <StoreImage
                          src={img ?? ""}
                          alt={product.name}
                          className="h-full w-full object-contain p-1"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <HighlightedLabel label={product.name} query={debounced} />
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {[sub ? `in ${sub}` : null, formatPrice(product.price)].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              }

              const label = item.kind === "history" ? item.entry.query : item.label;
              const sub = item.kind === "history" ? item.entry.categoryLabel : undefined;
              return (
                <li key={item.kind === "history" ? `h-${item.entry.ts}` : `t-${label}`} className={divider}>
                  <div className="flex min-h-14 items-center">
                    <button
                      type="button"
                      onClick={() =>
                        commit(label, item.kind === "history" ? item.entry : undefined)
                      }
                      className="flex min-h-14 min-w-0 flex-1 items-center gap-3 py-2 ps-4 text-left"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                        {item.kind === "history" ? (
                          <Clock className="h-4 w-4" strokeWidth={2} />
                        ) : (
                          <Search className="h-4 w-4" strokeWidth={2} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <HighlightedLabel label={label} query={debounced} />
                        {sub ? (
                          <span className="mt-0.5 block truncate text-xs font-semibold text-[#0a255d]">
                            {sub}
                          </span>
                        ) : null}
                      </span>
                    </button>
                    {item.kind === "history" ? (
                      <button
                        type="button"
                        onClick={() => removeEntry(item.entry)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border-0 bg-transparent text-gray-500"
                        aria-label={`Remove ${label} from recent searches`}
                      >
                        <X className="h-4 w-4" strokeWidth={2} />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setQuery(label)}
                      className="me-1 flex h-11 w-11 items-center justify-center rounded-full border-0 bg-transparent text-gray-500"
                      aria-label={`Edit search, ${label}`}
                    >
                      <ArrowUpLeft className="h-[18px] w-[18px]" strokeWidth={2} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}