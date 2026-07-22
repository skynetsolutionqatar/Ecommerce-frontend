"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fmt } from "@/lib/data";
import StoreImage from "./StoreImage";
import type { Product, WishlistItem } from "@/lib/types";
import { Colors } from "@/lib/theme";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, color: string, size: string) => void;
  onWishlistToggle: (item: WishlistItem) => void;
  isWishlisted: boolean;
  onClick: (product: Product) => void;
}

export default function ProductCard({
  product, onAddToCart, onWishlistToggle, isWishlisted, onClick,
}: ProductCardProps) {
  const [selectedColor] = useState(product.colors[0]);
  const [selectedSize] = useState(product.sizes[0] || "");
  const [addedAnim, setAddedAnim] = useState(false);

  const discountPct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedColor.name, selectedSize);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1800);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWishlistToggle({ id: product.id, name: product.name, brand: product.brand, price: product.price, img: product.images[0] });
  };

  return (
    <div
      className="group relative flex flex-col cursor-pointer bg-white hover:shadow-lg transition-shadow duration-200"
      style={{ borderRadius: "6px", border: "1px solid #e5e7eb", overflow: "hidden" }}
      onClick={() => onClick(product)}
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3", background: "#f3f4f6" }}>
        {/* Discount badge — dark navy like screenshot */}
        {discountPct && (
          <span
            className="absolute left-2.5 top-2.5 z-10 rounded px-2 py-0.5 text-[10.5px] font-bold text-white"
            style={{ background: "#a70a1cff" }}
          >
            {discountPct}% OFF
          </span>
        )}

        {/* NEW badge — green, top-right */}
        {product.isNew && (
          <span
            className="absolute right-10 top-2.5 z-10 rounded px-2 py-0.5 text-[10.5px] font-bold text-white"
            style={{ background: "#10b981" }}
          >
            NEW
          </span>
        )}

        {/* Wishlist heart — top-right */}
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 border-0 shadow-sm cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? "#ef4444" : "none"} stroke={isWishlisted ? "#ef4444" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Product image */}
        <div className="absolute inset-0 flex items-center justify-center p-5">
          <StoreImage
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* ── Info ── */}
      <div className="flex flex-1 flex-col px-3 pt-2 pb-3">
        {/* Brand */}
        <div className="mb-0.5 text-[9px] font-semibold uppercase tracking-widest text-gray-400">
          {product.brand}
        </div>

        {/* Name */}
        <div className="mb-1 line-clamp-2 text-[12.5px] font-semibold leading-snug text-gray-800" style={{ minHeight: "32px" }}>
          {product.name}
        </div>

        {/* Rating */}
        <div className="mb-1.5 flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
          <span className="text-[10.5px] font-bold text-gray-800">{product.rating}</span>
          <span className="text-[10.5px] text-gray-400">({product.reviews?.toLocaleString() ?? 0})</span>
        </div>

        {/* Price */}
        <div className="mb-1 flex flex-wrap items-baseline gap-1.5">
          <span className="text-[15px] font-extrabold text-gray-900">{fmt(product.price)}</span>
          {product.originalPrice && (
            <span className="text-[11px] text-gray-400 line-through">{fmt(product.originalPrice)}</span>
          )}
        </div>

        {/* Stock + Delivery */}
        <div className="mb-2.5 flex items-center gap-1 text-[10.5px]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
          <span className="font-medium text-green-600">In Stock</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500">Free Delivery</span>
        </div>

        {/* Add to Cart row — dark navy button matching screenshot */}
        <div className="flex items-center gap-1.5 mt-auto" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex flex-1 items-center justify-center gap-1.5 rounded py-2 text-[11px] font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: addedAnim ? "#15803d" : `${Colors.base_color}` }}
          >
            <AnimatePresence mode="wait">
              {addedAnim ? (
                <motion.span key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  ✓ Added!
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  + Add to Cart
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          {/* Compare icon — matching screenshot */}
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-gray-200 bg-white text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
