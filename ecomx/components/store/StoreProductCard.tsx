"use client";

import { motion } from "framer-motion";
import StoreImage from "@/components/StoreImage";
import { PRODUCT_STATUS } from "@/lib/Constant";
import { formatPrice } from "@/lib/utils";
import type { ApiProduct } from "@/types/product.types";
import { resolveApiCategoryName } from "@/lib/store/product-mapper";

interface StoreProductCardProps {
  product: ApiProduct;
  onClick: (product: ApiProduct) => void;
  onAddToCart?: (product: ApiProduct) => void;
  index?: number;
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

export default function StoreProductCard({
  product,
  onClick,
  onAddToCart,
  index = 0,
}: StoreProductCardProps) {
  const image = product.thumbnail ?? product.images?.[0];
  const compareAt = product.compareAtPrice;
  const discountPct =
    compareAt && compareAt > product.price
      ? Math.round(((compareAt - product.price) / compareAt) * 100)
      : null;
  const stock = stockLabel(product);
  const categoryName = resolveApiCategoryName(product);

  return (
    <motion.article
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-blue-400 hover:shadow-md"
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
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}

        {discountPct ? (
          <span className="absolute left-2 top-2 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
            {discountPct}% OFF
          </span>
        ) : null}

        {product.isNew ? (
          <span className="absolute right-2 top-2 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
            NEW
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col border-t border-gray-100 p-3">
        {categoryName ? (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            {categoryName}
          </p>
        ) : null}

        <h3 className="mb-1 line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900">
          {product.name}
        </h3>

        <p className="mb-2 text-[11px] text-gray-500">{product.sku ?? product.slug}</p>

        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-bold text-gray-900">{formatPrice(product.price)}</span>
          {compareAt && compareAt > product.price ? (
            <span className="text-[11px] text-gray-400 line-through">
              {formatPrice(compareAt)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] font-medium text-gray-500">{product.brand ?? "—"}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${stock.className}`}>
            {stock.text}
          </span>
        </div>

        {onAddToCart ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="mt-3 w-full rounded-lg bg-gray-900 py-2 text-[11px] font-bold text-white transition hover:bg-gray-800"
          >
            Add to Cart
          </button>
        ) : null}
      </div>
    </motion.article>
  );
}
