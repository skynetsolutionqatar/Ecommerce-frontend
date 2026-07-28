"use client";

import { motion } from "framer-motion";
import StoreImage from "@/components/StoreImage";
import { formatPrice } from "@/lib/utils";
import { apiProductToWishlistItem } from "@/lib/store/wishlist-helpers";
import type { ApiProduct } from "@/types/product.types";
import type { WishlistItem } from "@/lib/types";
import { type } from "@/lib/theme";

interface HomeScrollProductCardProps {
  product: ApiProduct;
  index?: number;
  imageHeight?: number;
  onClick: (product: ApiProduct) => void;
  onWishlistToggle?: (item: WishlistItem) => void;
  isWishlisted?: boolean;
  showBrand?: boolean;
}

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  if (rating <= 0 && reviews <= 0) return null;

  return (
    <div className="mb-1 flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            className="h-2.5 w-2.5"
            viewBox="0 0 24 24"
            fill={i <= Math.round(rating) ? "#F59E0B" : "#D1D5DB"}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      {reviews > 0 ? (
        <span className="font-label text-[9px] text-gray-400">({reviews})</span>
      ) : null}
    </div>
  );
}

function discountPercent(product: ApiProduct): number | null {
  const compareAt = product.compareAtPrice;
  if (compareAt && compareAt > product.price) {
    return Math.round(((compareAt - product.price) / compareAt) * 100);
  }
  return product.discountPercent && product.discountPercent > 0
    ? product.discountPercent
    : null;
}

export default function HomeScrollProductCard({
  product,
  index = 0,
  imageHeight = 130,
  onClick,
  onWishlistToggle,
  isWishlisted = false,
  showBrand = true,
}: HomeScrollProductCardProps) {
  const image = product.thumbnail ?? product.images?.[0];
  const discount = discountPercent(product);
  const compareAt = product.compareAtPrice;

  return (
    <motion.article
      role="button"
      tabIndex={0}
      onClick={() => onClick(product)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(product);
        }
      }}
      className="group flex shrink-0 cursor-pointer flex-col text-left"
      style={{
        width: "clamp(145px, 21vw, 188px)",
        background: "#fff",
        borderRadius: "14px",
        border: "1.5px solid #f0f0f0",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.055, duration: 0.35 }}
      whileHover={{
        y: -5,
        boxShadow: "0 16px 40px rgba(17,24,39,0.14)",
        borderColor: "#9CA3AF",
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="relative mx-2 mt-2 flex items-center justify-center overflow-hidden"
        style={{
          borderRadius: "10px",
          height: imageHeight,
          background: "linear-gradient(135deg, #f8f9fa, #f3f4f6)",
        }}
      >
        {image ? (
          <motion.div
            className="flex h-full w-full items-center justify-center p-3"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.35 }}
          >
            <StoreImage
              src={image}
              alt={product.name}
              className="h-full w-full object-contain drop-shadow-sm"
            />
          </motion.div>
        ) : (
          <span className="text-[10px] text-gray-400">No image</span>
        )}

        {discount ? (
          <span
            className="absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 font-label text-[9.5px] font-black text-white"
            style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)" }}
          >
            -{discount}%
          </span>
        ) : null}

        {product.isNew ? (
          <span
            className="absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 font-label text-[9px] font-black text-white"
            style={{ background: "linear-gradient(135deg,#0891b2,#0e7490)" }}
          >
            NEW
          </span>
        ) : null}

        {onWishlistToggle ? (
          <button
            type="button"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => {
              e.stopPropagation();
              onWishlistToggle(apiProductToWishlistItem(product));
            }}
            className="absolute bottom-1.5 right-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border-0 bg-white/95 shadow-sm"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill={isWishlisted ? "#ef4444" : "none"}
              stroke={isWishlisted ? "#ef4444" : "#9ca3af"}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-2.5 pt-2 pb-2.5">
        {showBrand && product.brand ? (
          <div className={`mb-0.5 ${type.eyebrow} text-[7.5px] tracking-widest text-gray-400 uppercase`}>
            {product.brand}
          </div>
        ) : null}

        <div className="mb-1 line-clamp-2 font-sans text-[11.5px] font-semibold leading-snug text-gray-800">
          {product.name}
        </div>

        <StarRating rating={product.averageRating ?? 0} reviews={product.reviewCount ?? 0} />

        <div className={`${type.price} text-[13.5px] font-extrabold text-gray-900`}>
          {formatPrice(product.price)}
        </div>

        {compareAt && compareAt > product.price ? (
          <div className="flex items-center gap-1.5">
            <span className={`${type.price} text-[10px] text-gray-400 line-through`}>
              {formatPrice(compareAt)}
            </span>
            {discount ? (
              <span className="font-label text-[9.5px] font-bold text-green-600">{discount}% off</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}
