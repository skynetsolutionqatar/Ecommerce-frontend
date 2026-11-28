"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  Grid3x3,
  Search,
  Sparkles,
  Star,
  Tag,
  Wallet,
} from "lucide-react";
import StoreImage from "@/components/StoreImage";
import MobileTabTitleHeader from "@/components/store/mobile/MobileTabTitleHeader";
import { useCategories, STORE_CATEGORY_QUERY } from "@/hooks/useCategories";
import { useCategoryScopeProducts } from "@/hooks/useCategoryScopeProducts";
import { apiProductImage } from "@/lib/store/api-product-display";
import { resolveCategoryBannerColor } from "@/lib/store/category-banner-style";
import { resolveCategoryIcon } from "@/lib/store/category-icons";
import {
  categoryOfferLine,
  popularProducts,
  topBrands,
} from "@/lib/store/category-insights";
import {
  categoryScopeIds,
  childCategories,
  departmentCategories,
  resolveCategoryId,
} from "@/lib/store/category-utils";
import { MOBILE_TAB_BAR_HEIGHT_PX } from "@/lib/store/mobile-chrome";
import { shopUrl } from "@/lib/routes";
import { PRODUCT_STATUS } from "@/lib/Constant";
import { formatPrice } from "@/lib/utils";
import { productImageSurfaceClass } from "@/lib/store/product-image-utils";
import type { ApiCategory } from "@/types/category.types";
import type { ApiProduct } from "@/types/product.types";

const PANE_LIMIT = 40;
const CHILD_PREFIX = "cat:";

type TypeTile = { key: string; label: string; icon: React.ReactNode };

const GENERIC_TYPES: TypeTile[] = [
  { key: "best-sellers", label: "Best sellers", icon: <Star className="h-6 w-6" /> },
  { key: "new", label: "New arrivals", icon: <Sparkles className="h-6 w-6" /> },
  { key: "sale", label: "On sale", icon: <Tag className="h-6 w-6" /> },
  { key: "under-300", label: "Under QAR 300", icon: <Wallet className="h-6 w-6" /> },
  { key: "all", label: "All products", icon: <Grid3x3 className="h-6 w-6" /> },
];

export default function MobileCategoriesTab({
  cartCount,
  onCartOpen,
  onProductClick,
}: {
  cartCount: number;
  onCartOpen: () => void;
  onProductClick: (product: ApiProduct) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requested = searchParams.get("category")?.trim() || undefined;
  const paneRef = useRef<HTMLDivElement>(null);

  const { data: categoryData, isLoading: categoriesLoading, isError, error, refetch } =
    useCategories(STORE_CATEGORY_QUERY);
  const categories = categoryData?.categories ?? [];
  const roots = useMemo(() => departmentCategories(categories), [categories]);

  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [draft, setDraft] = useState({ id: undefined as string | undefined, value: "" });
  const term = draft.id === selectedId ? draft.value : "";
  const prevRequested = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!roots.length) return;
    const cleared = Boolean(prevRequested.current) && !requested;
    prevRequested.current = requested;

    if (!requested) {
      setSelectedId((prev) => {
        if (cleared || !prev || !roots.some((c) => c._id === prev)) return roots[0]._id;
        return prev;
      });
      return;
    }
    const fromRoute = resolveCategoryId(categories, requested);
    let next = fromRoute;
    if (fromRoute && !roots.some((c) => c._id === fromRoute)) {
      const node = categories.find((c) => c._id === fromRoute);
      const parent = node?.parent;
      const parentId = !parent ? undefined : typeof parent === "string" ? parent : parent._id;
      if (parentId && roots.some((c) => c._id === parentId)) next = parentId;
    }
    setSelectedId(next && categories.some((c) => c._id === next) ? next : roots[0]._id);
  }, [requested, categories, roots]);

  useLayoutEffect(() => {
    if (paneRef.current) paneRef.current.scrollTop = 0;
  }, [selectedId]);

  const selected = categories.find((c) => c._id === selectedId);
  const scopeIds = useMemo(() => {
    if (!selectedId || !categories.length) return undefined;
    return categoryScopeIds(categories, selectedId);
  }, [categories, selectedId]);

  const productsQuery = useCategoryScopeProducts(
    scopeIds,
  selectedId
      ? {
          status: PRODUCT_STATUS.ACTIVE,
          limit: PANE_LIMIT,
          sortBy: "createdAt",
          sortOrder: "desc",
        }
      : undefined,
    Boolean(selectedId) && categories.length > 0
  );

  const products = productsQuery.data?.products ?? [];
  const productsLoading = Boolean(selectedId) && (categories.length === 0 || productsQuery.isLoading);
  const brands = useMemo(() => topBrands(products), [products]);
  const popular = useMemo(() => popularProducts(products), [products]);
  const offerLine = productsLoading
    ? null
    : categoryOfferLine(products, productsQuery.data?.pagination?.total);

  const tiles = useMemo<TypeTile[]>(() => {
    if (!selectedId) return [];
    const children = childCategories(categories, selectedId);
    if (!children.length) return GENERIC_TYPES;
    return children.map((c) => ({
      key: `${CHILD_PREFIX}${c._id}`,
      label: c.name,
      icon: resolveCategoryIcon(c.name),
    }));
  }, [categories, selectedId]);

  const selectCategory = useCallback(
    (category: ApiCategory) => {
      setSelectedId(category._id);
      const params = new URLSearchParams(searchParams.toString());
      params.set("category", category._id);
      params.delete("listing");
      params.delete("deals");
      router.replace(`${shopUrl()}?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const openType = useCallback(
    (tile: TypeTile) => {
      if (!selectedId) return;
      if (tile.key.startsWith(CHILD_PREFIX)) {
        const id = tile.key.slice(CHILD_PREFIX.length);
        router.push(shopUrl({ categoryId: id, listing: true }));
        return;
      }
      switch (tile.key) {
        case "best-sellers":
          router.push(shopUrl({ categoryId: selectedId, listing: true, isBestSeller: true }));
          break;
        case "new":
          router.push(shopUrl({ categoryId: selectedId, listing: true, isNew: true }));
          break;
        case "sale":
          router.push(shopUrl({ categoryId: selectedId, listing: true, hasDiscount: true }));
          break;
        case "under-300":
          router.push(shopUrl({ categoryId: selectedId, listing: true, maxPrice: 300 }));
          break;
        default:
          router.push(shopUrl({ categoryId: selectedId, listing: true }));
      }
    },
    [router, selectedId]
  );

  const submitSearch = () => {
    const q = term.trim();
    if (!q || !selectedId) return;
    router.push(shopUrl({ categoryId: selectedId, listing: true, search: q }));
  };

  const searchLabel = selected ? `Search in ${selected.name}` : "Search products";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#f1f3f6] md:hidden">
      <MobileTabTitleHeader title="Categories" cartCount={cartCount} onCartOpen={onCartOpen}>
        <div className="flex h-[46px] items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 shadow-sm">
          <Search className="h-5 w-5 shrink-0 text-gray-400" strokeWidth={1.8} />
          <input
            type="search"
            value={term}
            onChange={(e) => setDraft({ id: selectedId, value: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && submitSearch()}
            placeholder={searchLabel}
            aria-label={searchLabel}
            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>
      </MobileTabTitleHeader>

      {isError && !categories.length ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm font-semibold text-gray-900">Could not load categories</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 text-sm font-bold text-[#0a255d]"
          >
            Retry
          </button>
        </div>
      ) : !categoriesLoading && !categories.length ? (
        <p className="px-4 py-8 text-center text-sm text-gray-600">No categories yet.</p>
      ) : (
        <div className="flex min-h-0 flex-1 border-t border-gray-200">
          <nav
            className="w-[96px] shrink-0 overflow-y-auto border-r border-gray-200 bg-white"
            aria-label="Departments"
          >
            {categoriesLoading
              ? [0, 1, 2, 3].map((i) => (
                  <div key={i} className="mx-2 my-3 h-16 animate-pulse rounded-lg bg-gray-100" />
                ))
              : roots.map((cat) => {
                  const active = cat._id === selectedId;
                  return (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => selectCategory(cat)}
                      className={`relative flex w-full flex-col items-center gap-1 border-0 px-1 py-2.5 ${
                        active ? "bg-[#f1f3f6]" : "bg-white"
                      }`}
                    >
                      {active ? (
                        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r bg-[#0a255d]" />
                      ) : null}
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-lg border ${
                          active
                            ? "border-[#0a255d] bg-[#0a255d] text-white"
                            : "border-gray-200 bg-white text-gray-500"
                        } [&_svg]:h-[22px] [&_svg]:w-[22px]`}
                      >
                        {resolveCategoryIcon(cat.name)}
                      </span>
                      <span
                        className={`max-w-[88px] text-center text-[10px] leading-[13px] ${
                          active ? "font-extrabold text-[#0a255d]" : "font-semibold text-gray-600"
                        }`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
          </nav>

          <div
            ref={paneRef}
            className="min-h-0 flex-1 overflow-y-auto p-3.5"
            style={{ paddingBottom: MOBILE_TAB_BAR_HEIGHT_PX + 14 }}
          >
            {selected ? (
              <div className="flex flex-col gap-5">
                <div
                  className="relative overflow-hidden rounded-[22px] p-[18px] text-white"
                  style={{ background: resolveCategoryBannerColor(selected) }}
                >
                  <h2 className="text-xl font-extrabold leading-6">{selected.name}</h2>
                  {offerLine === null ? (
                    <div className="mt-2 h-3 w-[70%] animate-pulse rounded bg-white/25" />
                  ) : offerLine ? (
                    <p className="mt-1 text-[13px] font-medium text-white/80">{offerLine}</p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => router.push(shopUrl({ categoryId: selected._id, listing: true }))}
                    className="mt-3 inline-flex h-[34px] items-center gap-1 rounded-full bg-white px-3.5 text-[13px] font-extrabold text-gray-900"
                  >
                    Shop all
                    <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </button>
                </div>

                {tiles.length > 0 ? (
                  <section>
                    <h3 className="mb-3 text-sm font-extrabold text-gray-900">Shop by type</h3>
                    <div className="flex flex-wrap gap-y-3.5">
                      {tiles.map((tile) => (
                        <button
                          key={tile.key}
                          type="button"
                          onClick={() => openType(tile)}
                          className="flex w-1/3 flex-col items-center gap-1.5 border-0 bg-transparent px-1"
                        >
                          <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#0a255d]">
                            {tile.icon}
                          </span>
                          <span className="line-clamp-2 text-center text-xs font-semibold leading-[15px] text-gray-700">
                            {tile.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}

                {brands.length > 0 || productsLoading ? (
                  <section>
                    <h3 className="mb-3 text-sm font-extrabold text-gray-900">Top brands</h3>
                    <div className="flex flex-wrap gap-2">
                      {productsLoading
                        ? [64, 52, 80].map((w) => (
                            <div
                              key={w}
                              className="h-[34px] animate-pulse rounded-full bg-gray-200"
                              style={{ width: w }}
                            />
                          ))
                        : brands.map((brand) => (
                            <button
                              key={brand}
                              type="button"
                              onClick={() =>
                                router.push(
                                  shopUrl({ categoryId: selected._id, listing: true, brand })
                                )
                              }
                              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-800"
                            >
                              {brand}
                            </button>
                          ))}
                    </div>
                  </section>
                ) : null}

                {popular.length > 0 || productsLoading ? (
                  <section>
                    <h3 className="mb-2.5 text-sm font-extrabold text-gray-900">Popular right now</h3>
                    <p>
                      {productsLoading
                        ? [0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="mb-2 block h-[76px] animate-pulse rounded-[18px] bg-gray-200"
                            />
                          ))
                        : popular.map((product) => (
                            <button
                              key={product._id}
                              type="button"
                              onClick={() => onProductClick(product)}
                              className="mb-2 flex w-full gap-3 rounded-[18px] border border-gray-200 bg-white p-2.5 text-left"
                            >
                              <div
                                className={`h-14 w-14 shrink-0 rounded-lg p-1 ${productImageSurfaceClass}`}
                              >
                                {apiProductImage(product) ? (
                                  <StoreImage
                                    src={apiProductImage(product)!}
                                    alt=""
                                    className="h-full w-full object-contain"
                                  />
                                ) : null}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-[13px] font-semibold text-gray-900">
                                  {product.name}
                                </p>
                                <p className="mt-0.5 text-sm font-extrabold text-gray-900">
                                  {formatPrice(product.price)}
                                </p>
                              </div>
                            </button>
                          ))}
                    </p>
                  </section>
                ) : null}

                {productsQuery.isError ? (
                  <p className="text-center text-sm text-red-600">Could not load products.</p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-[136px] animate-pulse rounded-[22px] bg-gray-200" />
                <div className="h-[180px] animate-pulse rounded-xl bg-gray-200" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}