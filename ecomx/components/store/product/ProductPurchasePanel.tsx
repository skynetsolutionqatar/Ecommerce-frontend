"use client";

import { useState } from "react";
import { fmt } from "@/lib/data";
import type { Product } from "@/lib/types";
import type { ProductTrustBadge } from "@/lib/store/product-display";
import type { useProductPurchase } from "@/hooks/useProductPurchase";
import { Colors } from "@/lib/theme";
import StarRating from "./StarRating";

interface ProductPurchasePanelProps {
  product: Product;
  discount: number | null;
  recommendedLabel: string | null;
  trustBadges: ProductTrustBadge[];
  purchase: ReturnType<typeof useProductPurchase>;
}

export default function ProductPurchasePanel({
  product,
  discount,
  recommendedLabel,
  trustBadges,
  purchase,
}: ProductPurchasePanelProps) {
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);

  const {
    selectedSize,
    setSelectedSize,
    qty,
    setQty,
    maxQty,
    outOfStock,
    added,
    buying,
    buyError,
    addToCart,
    buyNow,
  } = purchase;

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {/* Brand + Authorized */}
      <div className="flex items-center gap-2">
        {product.brand ? (
          <span className="text-[13px] md:text-[12px] font-bold text-blue-700 uppercase tracking-wide">
            {product.brand}
          </span>
        ) : null}
        {product.badge ? (
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] md:text-[10px] font-semibold text-white"
            style={{ background: product.badgeColor || Colors.base_color }}
          >
            {product.badge}
          </span>
        ) : null}
      </div>

      {/* Product name */}
      <h1 className="font-display text-[24px] font-bold leading-tight text-gray-900 md:text-[28px]">
        {product.name}
      </h1>

      {product.shortDescription ? (
        <p className="text-[14px] md:text-[13px] leading-relaxed text-gray-600">
          {product.shortDescription}
        </p>
      ) : null}

      {/* Rating row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="origin-left scale-110 md:scale-100">
          <StarRating rating={product.rating} size={15} />
        </div>
        <span className="font-bold text-[14px] md:text-[13px] text-amber-500">
          {product.rating}
        </span>
        <span className="text-[13px] md:text-[12px] text-gray-500">
          ({product.reviews.toLocaleString()} reviews)
        </span>
        {recommendedLabel ? (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[12px] md:text-[11px] font-semibold text-gray-600">
            {recommendedLabel}
          </span>
        ) : null}
      </div>

      {/* Price block */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5">
        <span className="font-mono text-[26px] font-extrabold text-gray-900">
          {fmt(product.price)}
        </span>
        {product.originalPrice ? (
          <>
            <span className="text-[14px] text-gray-400 line-through">
              {fmt(product.originalPrice)}
            </span>
            <span
              className="rounded px-2 py-0.5 text-[12px] md:text-[11px] font-bold text-white"
              style={{ background: "#a70a1cff" }}
            >
              {discount}% OFF
            </span>
          </>
        ) : null}
      </div>

      {/* Feature tags */}
      {product.tags.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {product.tags.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1.5 text-[13px] md:text-[12px] font-medium text-gray-700"
            >
              <svg
                className="h-4 w-4 md:h-3.5 md:w-3.5 text-blue-600 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <polyline points="20,6 9,17 4,12" />
              </svg>
              {t}
            </span>
          ))}
        </div>
      ) : null}

      {/* Variant */}
      {product.sizes && product.sizes.length > 0 ? (
        <div>
          <div className="mb-2 text-[14px] md:text-[12.5px] font-semibold text-gray-700">
            Select Variant
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSize(s)}
                className={`rounded-lg border-2 px-4 py-2 md:py-1.5 text-[13px] md:text-[12px] font-semibold cursor-pointer transition-all ${
                  selectedSize === s
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Quantity + Stock */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-[14px] md:text-[12.5px] font-semibold text-gray-700">
          Quantity
        </span>
        <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className="flex h-9 w-9 md:h-8 md:w-8 items-center justify-center border-0 bg-white text-lg font-light text-gray-700 cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <span className="flex h-9 w-10 md:h-8 md:w-9 items-center justify-center border-x border-gray-200 text-[14px] md:text-[13px] font-bold">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={Number.isFinite(maxQty) && qty >= maxQty}
            className="flex h-9 w-9 md:h-8 md:w-8 items-center justify-center border-0 bg-white text-lg font-light text-gray-700 cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
        {product.stock !== undefined ? (
          <span className="text-[13px] md:text-[11.5px] font-medium text-green-600">
            {product.stock > 0
              ? `→ In Stock (${product.stock})`
              : "Out of Stock"}
          </span>
        ) : null}
        {Number.isFinite(maxQty) && qty >= maxQty && product.stock && product.stock > 0 ? (
          <span className="text-[12px] md:text-[11px] font-medium text-orange-600">Max available</span>
        ) : null}
      </div>

      {/* CTA Buttons — match screenshot: blue Add to Cart + dark Buy Now */}
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={addToCart}
          disabled={outOfStock}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border-0 py-3.5 md:py-3 text-[15px] md:text-[14px] font-bold text-white cursor-pointer transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: `${Colors.base_color}` }}
        >
          <svg
            className="h-[18px] w-[18px] md:h-4 md:w-4"
            viewBox="0 0 24 24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {added ? "Added to Cart!" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={() => void buyNow()}
          disabled={outOfStock || buying}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border-0 py-3.5 md:py-3 text-[15px] md:text-[14px] font-bold text-white cursor-pointer transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: "#111827" }}
        >
          {buying ? "Processing..." : "⚡ Buy Now"}
        </button>
      </div>
      {buyError ? (
        <p className="text-[12px] font-medium text-red-600">{buyError}</p>
      ) : null}

      {/* Delivery checker */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <div className="mb-2 text-[13px] md:text-[12px] font-bold text-gray-700">
          🚚 Check Delivery to Qatar
        </div>
        <div className="flex gap-2">
          <input
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value);
              setPincodeChecked(false);
            }}
            placeholder="Enter city or area (e.g. Lusail)"
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 md:py-2 text-[13px] md:text-[12px] outline-none focus:border-blue-400"
          />
          <button
            type="button"
            onClick={() => setPincodeChecked(true)}
            className="shrink-0 rounded-lg border-0 px-4 py-2.5 md:py-2 text-[13px] md:text-[12px] font-bold text-white cursor-pointer transition hover:opacity-90"
            style={{ background: Colors.base_color }}
          >
            Check
          </button>
        </div>
        {pincodeChecked && pincode ? (
          <p className="mt-1.5 text-[12px] md:text-[11px] font-medium text-green-600">
            ✓ Delivery available · 1–2 business days
          </p>
        ) : null}
      </div>

      {/* Trust badges */}
      {trustBadges.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {trustBadges.map((b) => (
            <div
              key={b.title}
              className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 md:px-2.5 md:py-2"
            >
              <span className="text-xl md:text-base shrink-0">{b.icon}</span>
              <div>
                <div className="text-[12px] md:text-[10.5px] font-bold text-gray-800">
                  {b.title}
                </div>
                <div className="text-[11px] md:text-[9.5px] text-gray-500">{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
