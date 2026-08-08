"use client";

import { motion } from "framer-motion";
import StoreImage from "@/components/StoreImage";
import { PRODUCT_STATUS } from "@/lib/Constant";
import { Colors } from "@/lib/theme";
import { formatPrice } from "@/lib/utils";
import type { ApiProduct } from "@/types/product.types";
import { resolveApiCategoryName } from "@/lib/store/product-mapper";

export type ShopViewMode = "grid" | "list";

interface StoreProductCardProps {
  product: ApiProduct;
  onClick: (product: ApiProduct) => void;
  onAddToCart?: (product: ApiProduct) => void;
  onBuyNow?: (product: ApiProduct) => void;
  onWishlistToggle?: (product: ApiProduct) => void;
  isWishlisted?: boolean;
  index?: number;
  variant?: ShopViewMode;
}

function stockLabel(product: ApiProduct): { text: string; className: string } {
  if (product.status !== PRODUCT_STATUS.ACTIVE) {
    return { text: "Unavailable", className: "bg-gray-100 text-gray-600" };
  }
  if ((product.stock ?? 0) <= 0) {
    return { text: "Out of stock", className: "bg-red-100 text-red-700" };
  }
  if (product.isLowStock) {
    return { text: "Low stock", className: "bg-orange-100 text-orange-700" };
  }
  return { text: "In stock", className: "bg-green-100 text-green-700" };
}

function WishlistButton({
  isWishlisted,
  onToggle,
}: {
  isWishlisted: boolean;
  onToggle: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      onClick={onToggle}
      className="flex h-9 w-9 md:h-8 md:w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-white/95 shadow-sm transition hover:scale-105"
    >
      <svg
        className="h-[17px] w-[17px] md:h-[15px] md:w-[15px]"
        viewBox="0 0 24 24"
        fill={isWishlisted ? "#ef4444" : "none"}
        stroke={isWishlisted ? "#ef4444" : "#9ca3af"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

function ActionButtons({
  onAdd,
  onBuy,
}: {
  onAdd?: (e: React.MouseEvent) => void;
  onBuy?: (e: React.MouseEvent) => void;
}) {
  if (!onAdd && !onBuy) return null;

  const btnBase =
    "flex min-h-[40px] w-full flex-1 items-center justify-center rounded-lg px-3 py-2.5 text-center text-[12px] font-bold leading-snug sm:min-h-[36px] sm:py-2 sm:text-[11px]";

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      {onAdd ? (
        <button
          type="button"
          onClick={onAdd}
          className={`${btnBase} cursor-pointer text-white transition hover:opacity-90 disabled:cursor-not-allowed`}
          style={{ background: Colors.base_color }}
        >
          Add to Cart
        </button>
      ) : null}
      {onBuy ? (
        <button
          type="button"
          onClick={onBuy}
          className={`${btnBase} cursor-pointer bg-gray-900 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed`}
        >
          Buy Now
        </button>
      ) : null}
    </div>
  );
}

export default function StoreProductCard({
  product,
  onClick,
  onAddToCart,
  onBuyNow,
  onWishlistToggle,
  isWishlisted = false,
  index = 0,
  variant = "grid",
}: StoreProductCardProps) {
  const image = product.thumbnail ?? product.images?.[0];
  const compareAt = product.compareAtPrice;
  const discountPct =
    compareAt && compareAt > product.price
      ? Math.round(((compareAt - product.price) / compareAt) * 100)
      : null;
  const stock = stockLabel(product);
  const categoryName = resolveApiCategoryName(product);
  const outOfStock = (product.stock ?? 0) <= 0 || product.status !== PRODUCT_STATUS.ACTIVE;

  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWishlistToggle?.(product);
  };
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!outOfStock) onAddToCart?.(product);
  };
  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!outOfStock) onBuyNow?.(product);
  };

  if (variant === "list") {
    return (
      <motion.article
        className="group flex cursor-pointer gap-3 overflow-hidden rounded-xl border border-gray-200 bg-white p-3 transition hover:border-[#0a255d]/40 hover:shadow-md sm:gap-4 sm:p-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02, duration: 0.25 }}
        onClick={() => onClick(product)}
      >
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-50 sm:h-28 sm:w-28">
          {image ? (
            <StoreImage src={image} alt={product.name} className="h-full w-full object-contain p-2" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm md:text-xs text-gray-400">No image</div>
          )}
          {discountPct ? (
            <span className="absolute left-1 top-1 rounded bg-red-600 px-1.5 py-0.5 text-[11px] md:text-[9px] font-bold text-white">
              {discountPct}% OFF
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0 flex-1">
            {categoryName ? (
              <p className="mb-0.5 text-[12px] md:text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {categoryName}
              </p>
            ) : null}
            <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900 sm:text-[14px]">
              {product.name}
            </h3>
            <p className="mt-0.5 text-[12px] md:text-[11px] text-gray-500">{product.brand ?? "—"} · {product.sku ?? product.slug}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-bold text-gray-900">{formatPrice(product.price)}</span>
              {compareAt && compareAt > product.price ? (
                <span className="text-[12px] md:text-[11px] text-gray-400 line-through">{formatPrice(compareAt)}</span>
              ) : null}
              <span className={`rounded-full px-2 py-0.5 text-[11px] md:text-[10px] font-medium ${stock.className}`}>
                {stock.text}
              </span>
            </div>
          </div>

          <div className="mt-3 flex shrink-0 items-center gap-2 sm:mt-0 sm:flex-col sm:items-stretch">
            {onWishlistToggle ? (
              <div className="hidden sm:flex sm:justify-end" onClick={stop}>
                <WishlistButton isWishlisted={isWishlisted} onToggle={handleWishlist} />
              </div>
            ) : null}
            {!outOfStock ? (
              <div className="w-full min-w-0 sm:min-w-[200px] md:min-w-[240px]" onClick={stop}>
                <ActionButtons onAdd={onAddToCart ? handleAdd : undefined} onBuy={onBuyNow ? handleBuy : undefined} />
              </div>
            ) : null}
          </div>
        </div>

        {onWishlistToggle ? (
          <div className="sm:hidden" onClick={stop}>
            <WishlistButton isWishlisted={isWishlisted} onToggle={handleWishlist} />
          </div>
        ) : null}
      </motion.article>
    );
  }

  return (
    <motion.article
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-[#0a255d]/40 hover:shadow-md"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      onClick={() => onClick(product)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        {image ? (
          <StoreImage
            src={image}
            alt={product.name}
            className="h-full w-full object-contain p-3 transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm md:text-xs text-gray-400">No image</div>
        )}

        {discountPct ? (
          <span className="absolute left-2 top-2 rounded-md bg-red-600 px-2 py-0.5 text-[11px] md:text-[10px] font-bold text-white">
            {discountPct}% OFF
          </span>
        ) : null}

        {product.isNew ? (
          <span className="absolute right-2 top-2 rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] md:text-[10px] font-bold text-white">
            NEW
          </span>
        ) : null}

        {onWishlistToggle ? (
          <div className="absolute bottom-2 right-2 z-10" onClick={stop}>
            <WishlistButton isWishlisted={isWishlisted} onToggle={handleWishlist} />
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col border-t border-gray-100 p-3">
        {categoryName ? (
          <p className="mb-1 text-[12px] md:text-[10px] font-semibold uppercase tracking-wide text-gray-400">{categoryName}</p>
        ) : null}

        <h3 className="mb-1 line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900">{product.name}</h3>

        <p className="mb-2 text-[12px] md:text-[11px] text-gray-500">{product.sku ?? product.slug}</p>

        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-bold text-gray-900">{formatPrice(product.price)}</span>
          {compareAt && compareAt > product.price ? (
            <span className="text-[12px] md:text-[11px] text-gray-400 line-through">{formatPrice(compareAt)}</span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-[12px] md:text-[11px] font-medium text-gray-500">{product.brand ?? "—"}</span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] md:text-[10px] font-medium ${stock.className}`}>{stock.text}</span>
        </div>

        {!outOfStock && (onAddToCart || onBuyNow) ? (
          <div className="mt-3" onClick={stop}>
            <ActionButtons onAdd={onAddToCart ? handleAdd : undefined} onBuy={onBuyNow ? handleBuy : undefined} />
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}
