"use client";

import type { Product, WishlistItem } from "@/lib/types";
import type { useProductGallery } from "@/hooks/useProductGallery";
import { productImageSurfaceClass } from "@/lib/store/product-image-utils";
import StoreImage from "../../StoreImage";
import * as Icons from "../../Icons";

interface ProductGalleryProps {
  product: Product;
  discount: number | null;
  isWishlisted: boolean;
  onWishlistToggle: (item: WishlistItem) => void;
  gallery: ReturnType<typeof useProductGallery>;
}

export default function ProductGallery({
  product,
  discount,
  isWishlisted,
  onWishlistToggle,
  gallery,
}: ProductGalleryProps) {
  const {
    activeIndex,
    thumbOffset,
    thumbVisible,
    canScrollThumbsUp,
    canScrollThumbsDown,
    selectImage,
    scrollThumbsUp,
    scrollThumbsDown,
    showPreviousImage,
    showNextImage,
  } = gallery;

  return (
    <div className="flex flex-col gap-3 md:flex-row">
      {/* Thumbnail strip with vertical scroll arrows */}
      <div className="hidden w-[72px] shrink-0 flex-col items-center gap-1.5 md:flex">
        <button
          type="button"
          onClick={scrollThumbsUp}
          disabled={!canScrollThumbsUp}
          aria-label="Scroll thumbnails up"
          className="flex h-7 w-[72px] items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 transition hover:border-gray-300 hover:text-gray-600 disabled:cursor-default disabled:opacity-30"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>

        <div className="flex w-full flex-col gap-1.5">
          {product.images
            .slice(thumbOffset, thumbOffset + thumbVisible)
            .map((img, i) => {
              const actualIndex = thumbOffset + i;
              return (
                <button
                  key={actualIndex}
                  type="button"
                  onClick={() => selectImage(actualIndex)}
                  className={`h-[72px] w-[72px] overflow-hidden rounded-md border-2 p-1.5 transition-all cursor-pointer ${productImageSurfaceClass} ${
                    activeIndex === actualIndex
                      ? "border-blue-600"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <StoreImage
                    src={img}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </button>
              );
            })}
        </div>

        <button
          type="button"
          onClick={scrollThumbsDown}
          disabled={!canScrollThumbsDown}
          aria-label="Scroll thumbnails down"
          className="flex h-7 w-[72px] items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 transition hover:border-gray-300 hover:text-gray-600 disabled:cursor-default disabled:opacity-30"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Main image + controls */}
      <div className="flex flex-1 flex-col gap-2">
        <div className={`relative flex flex-1 overflow-hidden rounded-xl border border-gray-200 min-h-[280px] md:min-h-[420px] ${productImageSurfaceClass}`}>
          {/* Badges — same row */}
          <div className="absolute left-3 top-3 z-10 flex flex-row flex-wrap items-center gap-1.5">
            {discount ? (
              <span
                className="rounded px-2 py-0.5 text-[12px] md:text-[11px] font-bold text-white"
                style={{ background: "#a70a1cff" }}
              >
                -{discount}% OFF
              </span>
            ) : null}
            {product.badge ? (
              <span
                className="rounded px-2 py-0.5 text-[12px] md:text-[11px] font-bold text-white"
                style={{ background: "#10b981" }}
              >
                {product.badge}
              </span>
            ) : null}
          </div>

          {/* Wishlist */}
          <button
            type="button"
            onClick={() =>
              onWishlistToggle({
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                img: product.images[0],
              })
            }
            className={`absolute right-3 top-3 z-10 flex h-10 w-10 md:h-9 md:w-9 items-center justify-center rounded-full border-2 bg-white transition-all cursor-pointer ${
              isWishlisted
                ? "border-red-400 text-red-500"
                : "border-gray-200 text-gray-400 hover:border-red-300"
            }`}
          >
            <svg
              className="h-[17px] w-[17px] md:h-[15px] md:w-[15px]"
              viewBox="0 0 24 24"
              fill={isWishlisted ? "#ef4444" : "none"}
              stroke={isWishlisted ? "#ef4444" : "#9ca3af"}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Main image */}
          <div className="flex h-full w-full items-center justify-center px-8 py-10">
            <StoreImage
              src={product.images[activeIndex] ?? product.images[0]}
              alt={product.name}
              className="max-h-[360px] max-w-full object-contain"
              priority
            />
          </div>
        </div>

        {/* Slider arrows + dots — under image */}
        <div className="flex items-center justify-center gap-4 py-1">
          <button
            type="button"
            onClick={showPreviousImage}
            disabled={activeIndex === 0}
            aria-label="Previous image"
            className="flex h-9 w-9 md:h-8 md:w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition hover:text-gray-600 disabled:cursor-default disabled:opacity-40"
          >
            <Icons.ChevronLeft />
          </button>

          <div className="flex items-center gap-1.5">
            {product.images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectImage(i)}
                aria-label={`View image ${i + 1}`}
                className={`cursor-pointer border-0 transition-all ${
                  activeIndex === i
                    ? "h-2 w-5 md:h-1.5 md:w-4 rounded-full bg-blue-600"
                    : "h-2 w-2 md:h-1.5 md:w-1.5 rounded-full bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={showNextImage}
            disabled={activeIndex === product.images.length - 1}
            aria-label="Next image"
            className="flex h-9 w-9 md:h-8 md:w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition hover:text-gray-600 disabled:cursor-default disabled:opacity-40"
          >
            <Icons.ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
