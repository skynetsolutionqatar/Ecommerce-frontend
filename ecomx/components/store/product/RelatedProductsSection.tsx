"use client";

import { fmt } from "@/lib/data";
import type { Product, WishlistItem } from "@/lib/types";
import { tw } from "@/lib/theme";
import StoreImage from "../../StoreImage";

interface RelatedProductsSectionProps {
  products: Product[];
  isLoading: boolean;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product, color: string, size: string, qty?: number) => void;
  onWishlistToggle: (item: WishlistItem) => void;
  isWishlisted: (productId: string) => boolean;
}

export default function RelatedProductsSection({
  products,
  isLoading,
  onProductClick,
  onAddToCart,
  onWishlistToggle,
  isWishlisted,
}: RelatedProductsSectionProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-4 py-6 shadow-sm sm:px-6 md:px-8">
      <h2 className="mb-4 font-display text-[18px] font-bold text-gray-900">
        You Might Also <span className="italic text-[#0a255dff]">Like</span>
      </h2>
      <div
        className={`flex gap-3 overflow-x-auto scroll-smooth ${tw.scrollbarHide} pb-2`}
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex shrink-0 animate-pulse flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
              style={{ width: "170px" }}
            >
              <div className="h-[110px] bg-gray-100" />
              <div className="space-y-2 px-2.5 py-3">
                <div className="h-2 w-12 rounded bg-gray-100" />
                <div className="h-3 w-full rounded bg-gray-100" />
                <div className="h-3 w-2/3 rounded bg-gray-100" />
              </div>
            </div>
          ))
        ) : products.length === 0 ? (
          <p className="text-sm text-gray-500">No related products found.</p>
        ) : (
          products.map((p) => {
            const pd = p.originalPrice
              ? Math.round(
                  ((p.originalPrice - p.price) / p.originalPrice) * 100
                )
              : null;
            return (
              <div
                key={p.id}
                className="flex shrink-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
                style={{ width: "170px" }}
              >
                <div className="relative flex h-[110px] items-center justify-center overflow-hidden bg-gray-50">
                  {pd ? (
                    <span
                      className="absolute left-1.5 top-1.5 z-10 rounded px-1.5 py-0.5 text-[10px] md:text-[9px] font-bold text-white"
                      style={{ background: "#a70a1cff" }}
                    >
                      -{pd}% OFF
                    </span>
                  ) : null}
                  {p.isNew ? (
                    <span
                      className="absolute right-1.5 top-1.5 z-10 rounded px-1.5 py-0.5 text-[10px] md:text-[9px] font-bold text-white"
                      style={{ background: "#10b981" }}
                    >
                      NEW
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onProductClick(p)}
                    className="flex h-full w-full cursor-pointer items-center justify-center border-0 bg-transparent p-3"
                  >
                    <StoreImage
                      src={p.images[0]}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </button>
                </div>
                <div className="flex flex-1 flex-col px-2.5 pt-2 pb-2.5">
                  <div className="mb-0.5 text-[10px] md:text-[8px] font-bold uppercase tracking-widest text-gray-400">
                    {p.brand}
                  </div>
                  <div className="mb-1 flex items-center gap-px">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        className="h-[11px] w-[11px] md:h-[9px] md:w-[9px]"
                        viewBox="0 0 24 24"
                        fill={
                          s <= Math.round(p.rating) ? "#F59E0B" : "#D1D5DB"
                        }
                      >
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                    ))}
                    <span className="ml-0.5 text-[11px] md:text-[9px] font-bold text-amber-500">
                      {p.rating}
                    </span>
                    <span className="text-[11px] md:text-[9px] text-gray-400">
                      ({p.reviews})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onProductClick(p)}
                    className="mb-1 cursor-pointer border-0 bg-transparent text-left"
                  >
                    <span className="line-clamp-2 text-[12px] md:text-[11px] font-semibold leading-snug text-gray-800">
                      {p.name}
                    </span>
                  </button>
                  <span
                    className={`mb-0.5 text-[11px] md:text-[10px] font-semibold ${p.stock != null && p.stock <= 0 ? "text-red-500" : "text-green-600"}`}
                  >
                    {p.stock != null && p.stock <= 0 ? "Out of Stock" : "In Stock"}
                  </span>
                  <div className="text-[13px] font-extrabold text-gray-900">
                    {fmt(p.price)}
                  </div>
                  {p.originalPrice ? (
                    <div className="text-[11px] md:text-[10px] text-gray-400 line-through">
                      {fmt(p.originalPrice)}
                    </div>
                  ) : null}
                  <div className="mt-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        onAddToCart(
                          p,
                          p.colors[0]?.name ?? "Default",
                          p.sizes?.[0] ?? ""
                        )
                      }
                      className="flex min-h-[36px] flex-1 cursor-pointer items-center justify-center rounded px-2.5 py-2 text-center text-[11px] font-bold leading-snug text-white hover:opacity-90 sm:py-1.5 sm:text-[10px]"
                      style={{ background: "#1e3a8a" }}
                    >
                      + Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onWishlistToggle({
                          id: p.id,
                          name: p.name,
                          brand: p.brand,
                          price: p.price,
                          img: p.images[0],
                        })
                      }
                      className="flex h-8 w-8 md:h-7 md:w-7 shrink-0 cursor-pointer items-center justify-center rounded border border-gray-200 bg-white"
                    >
                      <svg
                        className="h-[13px] w-[13px] md:h-[11px] md:w-[11px]"
                        viewBox="0 0 24 24"
                        fill={isWishlisted(p.id) ? "#ef4444" : "none"}
                        stroke={isWishlisted(p.id) ? "#ef4444" : "#9ca3af"}
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
