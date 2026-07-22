"use client";
import { useState, useEffect } from "react";
import { PRODUCTS, fmt } from "@/lib/data";
import type { Product, WishlistItem } from "@/lib/types";
import StoreImage from "./StoreImage";
import LazyMount from "./LazyMount";
import * as Icons from "./Icons";
import { Colors, tw } from "@/lib/theme";

interface ProductPageProps {
  product: Product;
  onAddToCart: (product: Product, color: string, size: string) => void;
  onWishlistToggle: (item: WishlistItem) => void;
  isWishlisted: boolean;
  onBack: () => void;
  onProductClick: (product: Product) => void;
  wishlist: WishlistItem[];
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-px">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? "#F59E0B" : "none"}
          stroke={i <= Math.round(rating) ? "#F59E0B" : "#D1D5DB"}
          strokeWidth="1.5"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

const TABS = ["Description", "Specifications", "Downloads", "Support"] as const;
type Tab = (typeof TABS)[number];

export default function ProductPage({
  product,
  onAddToCart,
  onWishlistToggle,
  isWishlisted,
  onBack,
  onProductClick,
  wishlist,
}: ProductPageProps) {
  const [imgIdx, setImgIdx] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [tab, setTab] = useState<Tab>("Description");

  const similar = PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category
  ).slice(0, 6);
  const fallbackSimilar = PRODUCTS.filter((p) => p.id !== product.id).slice(
    0,
    6
  );
  const relatedProducts = similar.length >= 3 ? similar : fallbackSimilar;

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    setImgIdx(0);
    setThumbOffset(0);
  }, [product.id]);

  const THUMB_VISIBLE = 4;

  const canScrollThumbsUp = thumbOffset > 0;
  const canScrollThumbsDown =
    thumbOffset + THUMB_VISIBLE < product.images.length;

  const selectImage = (index: number) => {
    setImgIdx(index);
    if (index < thumbOffset) {
      setThumbOffset(index);
    } else if (index >= thumbOffset + THUMB_VISIBLE) {
      setThumbOffset(Math.max(0, index - THUMB_VISIBLE + 1));
    }
  };

  const scrollThumbsUp = () => setThumbOffset((o) => Math.max(0, o - 1));
  const scrollThumbsDown = () =>
    setThumbOffset((o) =>
      Math.min(product.images.length - THUMB_VISIBLE, o + 1)
    );

  const prevImage = () => selectImage(Math.max(0, imgIdx - 1));
  const nextImage = () =>
    selectImage(Math.min(product.images.length - 1, imgIdx + 1));

  const handleAdd = () => {
    onAddToCart(product, product.colors[0]?.name ?? "Default", selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const crumbs = [
    "Home",
    product.category || "Printers",
    "Label Printers",
    product.name,
  ];

  return (
    <div
      className={`${tw.pageTopOffset} min-h-screen pb-10`}
      style={{ background: "#f1f3f6" }}
    >
      <div className="mx-auto max-w-[1440px] px-3 sm:px-5 md:px-8 lg:px-[50px] pt-4 flex flex-col gap-3">
        {/* Breadcrumb */}
        <div className="bg-white py-3 px-4 sm:px-6 md:px-8 rounded-2xl shadow-sm border border-gray-100">
          <nav className="flex items-center gap-1 text-[11.5px] text-gray-500">
            {crumbs.map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-1">
                {i > 0 && <span className="text-gray-300">›</span>}
                {i < crumbs.length - 1 ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="text-gray-600 hover:text-blue-600 border-0 bg-transparent cursor-pointer hover:underline"
                  >
                    {crumb}
                  </button>
                ) : (
                  <span className="text-gray-700 font-medium line-clamp-1">
                    {crumb}
                  </span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Main product section */}
        <div className="bg-white py-6 lg:py-8 px-4 sm:px-6 md:px-8 rounded-2xl shadow-sm border border-gray-100">
          {/* SKU top-right */}
          <div className="mb-2 flex justify-end">
            {product.sku && (
              <span className="text-[11px] text-gray-400">
                SKU: {product.sku}
              </span>
            )}
          </div>

          {/* <div className="grid grid-cols-1 gap-6 lg:grid-cols-[460px_1fr] xl:grid-cols-[500px_1fr]"> */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[58%_42%] xl:grid-cols-[60%_40%]">
            {/* ─── LEFT: Image Gallery ─── */}
            <div className="flex gap-3">
              {/* Thumbnail strip with vertical scroll arrows */}
              <div className="flex w-[72px] shrink-0 flex-col items-center gap-1.5">
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
                    .slice(thumbOffset, thumbOffset + THUMB_VISIBLE)
                    .map((img, i) => {
                      const actualIndex = thumbOffset + i;
                      return (
                        <button
                          key={actualIndex}
                          type="button"
                          onClick={() => selectImage(actualIndex)}
                          className={`h-[72px] w-[72px] overflow-hidden rounded-md border-2 bg-white p-1.5 transition-all cursor-pointer ${
                            imgIdx === actualIndex
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
                <div
                  className="relative flex flex-1 overflow-hidden rounded-xl border border-gray-200 bg-[#fafafa]"
                  style={{ minHeight: "420px" }}
                >
                  {/* Badges — same row */}
                  <div className="absolute left-3 top-3 z-10 flex flex-row flex-wrap items-center gap-1.5">
                    {discount && (
                      <span
                        className="rounded px-2 py-0.5 text-[11px] font-bold text-white"
                        style={{ background: "#a70a1cff" }}
                      >
                        -{discount}% OFF
                      </span>
                    )}
                    {product.badge && (
                      <span
                        className="rounded px-2 py-0.5 text-[11px] font-bold text-white"
                        style={{ background: "#10b981" }}
                      >
                        {product.badge}
                      </span>
                    )}
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
                    className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white transition-all cursor-pointer ${
                      isWishlisted
                        ? "border-red-400 text-red-500"
                        : "border-gray-200 text-gray-400 hover:border-red-300"
                    }`}
                  >
                    <svg
                      width="15"
                      height="15"
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
                      src={product.images[imgIdx] ?? product.images[0]}
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
                    onClick={prevImage}
                    disabled={imgIdx === 0}
                    aria-label="Previous image"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition hover:text-gray-600 disabled:cursor-default disabled:opacity-40"
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
                          imgIdx === i
                            ? "h-1.5 w-4 rounded-full bg-blue-600"
                            : "h-1.5 w-1.5 rounded-full bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={nextImage}
                    disabled={imgIdx === product.images.length - 1}
                    aria-label="Next image"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition hover:text-gray-600 disabled:cursor-default disabled:opacity-40"
                  >
                    <Icons.ChevronRight />
                  </button>
                </div>
              </div>
            </div>

            {/* ─── RIGHT: Product Info ─── */}
            <div className="flex flex-col gap-3 min-w-0">
              {/* Brand + Authorized */}
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-blue-700 uppercase tracking-wide">
                  {product.brand}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block" />
                  Authorized Distributor
                </span>
              </div>

              {/* Product name */}
              <h1 className="font-display text-[24px] font-bold leading-tight text-gray-900 md:text-[28px]">
                {product.name}
              </h1>

              {/* Rating row */}
              <div className="flex flex-wrap items-center gap-2">
                <StarRating rating={product.rating} size={15} />
                <span className="font-bold text-[13px] text-amber-500">
                  {product.rating}
                </span>
                <span className="text-[12px] text-gray-500">
                  ({product.reviews.toLocaleString()} reviews)
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                  {Math.round(product.rating * 20)}% recommended
                </span>
              </div>

              {/* Price block */}
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5">
                <span className="font-mono text-[26px] font-extrabold text-gray-900">
                  {fmt(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-[14px] text-gray-400 line-through">
                      {fmt(product.originalPrice)}
                    </span>
                    <span
                      className="rounded px-2 py-0.5 text-[11px] font-bold text-white"
                      style={{ background: "#a70a1cff" }}
                    >
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Feature tags */}
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {product.tags.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1 text-[12px] font-medium text-gray-700"
                    >
                      <svg
                        className="h-3.5 w-3.5 text-blue-600 shrink-0"
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
              )}

              {/* Variant */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="mb-2 text-[12.5px] font-semibold text-gray-700">
                    Select Variant
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`rounded-lg border-2 px-4 py-1.5 text-[12px] font-semibold cursor-pointer transition-all ${
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
              )}

              {/* Quantity + Stock */}
              <div className="flex items-center gap-4">
                <span className="text-[12.5px] font-semibold text-gray-700">
                  Quantity
                </span>
                <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center border-0 bg-white text-gray-700 cursor-pointer hover:bg-gray-50 text-lg font-light"
                  >
                    −
                  </button>
                  <span className="flex h-8 w-9 items-center justify-center border-x border-gray-200 text-[13px] font-bold">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="flex h-8 w-8 items-center justify-center border-0 bg-white text-gray-700 cursor-pointer hover:bg-gray-50 text-lg font-light"
                  >
                    +
                  </button>
                </div>
                {product.stock !== undefined && (
                  <span className="text-[11.5px] font-medium text-green-600">
                    {product.stock > 0
                      ? `→ In Stock (${product.stock})`
                      : "Out of Stock"}
                  </span>
                )}
              </div>

              {/* CTA Buttons — match screenshot: blue Add to Cart + dark Buy Now */}
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-[14px] font-bold text-white border-0 cursor-pointer transition-opacity hover:opacity-90"
                  style={{ background: `${Colors.base_color}` }}
                >
                  <svg
                    width="16"
                    height="16"
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
                  onClick={handleAdd}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-[14px] font-bold text-white border-0 cursor-pointer transition-colors hover:bg-gray-800"
                  style={{ background: "#111827" }}
                >
                  ⚡ Buy Now
                </button>
              </div>

              {/* Delivery checker */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="mb-2 text-[12px] font-bold text-gray-700">
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
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] outline-none focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setPincodeChecked(true)}
                    className="shrink-0 rounded-lg border-0 px-4 py-2 text-[12px] font-bold text-white cursor-pointer transition hover:opacity-90"
                    style={{ background: Colors.base_color }}
                  >
                    Check
                  </button>
                </div>
                {pincodeChecked && pincode && (
                  <p className="mt-1.5 text-[11px] font-medium text-green-600">
                    ✓ Delivery available · 1–2 business days
                  </p>
                )}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  {
                    icon: "🔧",
                    title: "Free Installation",
                    sub: "For POS Systems",
                  },
                  {
                    icon: "🛡️",
                    title: "1 Year Warranty",
                    sub: "Parts & Labour",
                  },
                  {
                    icon: "📋",
                    title: "Qatar VAT Ready",
                    sub: "VAT Compliant",
                  },
                  { icon: "📞", title: "24/7 Support", sub: "Local Support" },
                ].map((b) => (
                  <div
                    key={b.title}
                    className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-2.5 py-2"
                  >
                    <span className="text-base shrink-0">{b.icon}</span>
                    <div>
                      <div className="text-[10.5px] font-bold text-gray-800">
                        {b.title}
                      </div>
                      <div className="text-[9.5px] text-gray-500">{b.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Tabs, Reviews, Related — below fold ─── */}
        <LazyMount>
        {/* ─── Tabs ─── */}
        <div className="bg-white px-4 sm:px-6 md:px-8 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`relative shrink-0 px-5 py-3.5 border-0 cursor-pointer text-[13px] font-semibold transition-colors ${
                  tab === t
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t}
                {tab === t && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t" />
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 py-6 lg:grid-cols-[1fr_220px]">
            <div className="text-[13.5px] leading-relaxed text-gray-700">
              {tab === "Description" && (
                <>
                  <p className="font-medium text-gray-800 mb-2">
                    Compact desktop barcode and label printer designed for
                    warehouses and retail inventory management.
                  </p>
                  <p>{product.description}</p>
                  <p className="mt-3">
                    The Honeywell PC42t is a reliable thermal transfer printer
                    delivering fast, high-quality printing at 203 DPI. It
                    supports a wide range of label sizes and media types, making
                    it ideal for retail, logistics, healthcare, and warehouse
                    operations.
                  </p>
                  <p className="mt-3">
                    Backed by Skynet Solution Qatar&apos;s full implementation
                    and support service including installation, software
                    configuration, staff training, and priority technical
                    support. All products are Qatar VAT compliant and integrate
                    seamlessly with atACC ERP.
                  </p>
                </>
              )}
              {tab === "Specifications" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    ["SKU", product.sku || "—"],
                    ["Category", product.category || "—"],
                    ["In Stock", `${product.stock || "—"} units`],
                    ["Warranty", "1 Year (Parts & Labour)"],
                    ["Certification", "Qatar VAT Compliant"],
                    ["Support", "24/7 Local Doha Team"],
                    ["Interface", product.tags[0] || "USB"],
                    ["Brand Origin", "Commercial Grade"],
                  ].map(([l, v]) => (
                    <div
                      key={l}
                      className="flex flex-col gap-0.5 rounded-lg bg-gray-50 px-3 py-2.5"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        {l}
                      </span>
                      <span className="text-[13px] font-medium text-gray-800">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {tab === "Downloads" && (
                <div className="flex flex-col gap-3">
                  {[
                    "Product Datasheet",
                    "Quick Start Guide",
                    "Warranty Certificate",
                    "VAT Compliance Certificate",
                  ].map((doc) => (
                    <div
                      key={doc}
                      className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
                    >
                      <span className="flex items-center gap-2 text-[13px] font-medium text-gray-700">
                        <span className="text-blue-600">📄</span> {doc}
                      </span>
                      <button
                        type="button"
                        className="text-[12px] font-bold text-blue-600 border-0 bg-transparent cursor-pointer hover:underline"
                      >
                        Download PDF
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {tab === "Support" && (
                <ul className="flex flex-col gap-3">
                  {[
                    "Call +974 4431 1525 for 24/7 technical support",
                    "Remote desktop support available for software issues",
                    "On-site engineer visits for hardware faults (Doha)",
                    "Replacement units within 24 hours under warranty",
                    "Annual Maintenance Contracts (AMC) available",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2.5">
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Feature bullets — right col */}
            <div className="hidden lg:flex flex-col gap-2">
              {[
                "Fast & reliable printing",
                "Easy media loading",
                "Compact & space-saving",
                "High-quality 203 DPI resolution",
                "Compatible with major platforms",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-[12.5px] text-gray-700"
                >
                  <svg
                    className="h-3.5 w-3.5 shrink-0 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Reviews ─── */}
        <div className="bg-white py-6 px-4 sm:px-6 md:px-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-[19px] font-bold text-gray-900">
              Customer Reviews
            </h2>
            <button
              type="button"
              className="text-[13px] font-semibold text-blue-600 hover:underline border-0 bg-transparent cursor-pointer"
            >
              View All Reviews →
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr]">
            {/* Summary */}
            <div>
              <div className="flex items-end gap-2">
                <span className="font-display text-[52px] font-extrabold leading-none text-gray-900">
                  {product.rating}
                </span>
                <div className="pb-1">
                  <StarRating rating={product.rating} size={18} />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Based on {product.reviews} reviews
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-1.5">
                {[5, 4, 3, 2, 1].map((star, idx) => {
                  const ratios = [0.68, 0.16, 0.08, 0.05, 0.03];
                  const count = Math.round(product.reviews * ratios[idx]);
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="w-3 text-right text-[11px] font-semibold text-gray-600">
                        {star}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.round(ratios[idx] * 100)}%`,
                            background:
                              star >= 4
                                ? "#1d4ed8"
                                : star === 3
                                ? "#94a3b8"
                                : "#e2e8f0",
                          }}
                        />
                      </div>
                      <span className="w-7 text-right text-[11px] text-gray-400">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                className="mt-4 rounded-lg border border-blue-600 px-4 py-2 text-[12px] font-bold text-blue-600 cursor-pointer bg-transparent hover:bg-blue-50"
              >
                Write a Review
              </button>
            </div>

            {/* Review cards */}
            <div className="flex flex-col gap-4">
              {[
                {
                  name: "Fatima H.",
                  location: "Doha, Qatar",
                  rating: 5,
                  date: "Dec 15, 2024",
                  title: "Reliable label printing for warehouse",
                  body: "Runs 10+ hours daily in our warehouse. Labels are crisp at 203 DPI and setup with Skynet was same-day. Support answered every question quickly.",
                  tags: ["Label Printing", "4 Inch • USB"],
                  helpful: 87,
                },
                {
                  name: "Mohammed R.",
                  location: "West Bay, Qatar",
                  rating: 4,
                  date: "Nov 28, 2024",
                  title: "Great product, quick delivery",
                  body: "Excellent build quality. Integration with our atACC ERP was smooth. Skynet's support team helped configure it remotely within 2 hours.",
                  tags: ["USB", "Windows"],
                  helpful: 43,
                },
              ].map((rev, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[14px] font-bold text-orange-600">
                        {rev.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-gray-900">
                          {rev.name}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {rev.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <StarRating rating={rev.rating} size={12} />
                      <div className="mt-0.5 text-[10.5px] text-gray-400">
                        {rev.date}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="mb-1.5 inline-block rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                      ✓ Verified Purchase
                    </span>
                    <p className="text-[13px] font-semibold text-gray-900">
                      {rev.title}
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-gray-600">
                      {rev.body}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {rev.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[10.5px] font-medium text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-[11px] text-gray-400">
                      👍 Helpful ({rev.helpful})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── You Might Also Like ─── */}
        <div className="bg-white py-6 px-4 sm:px-6 md:px-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="mb-4 font-display text-[18px] font-bold text-gray-900">
            You Might Also <span className="italic text-[#0a255dff]">Like</span>
          </h2>
          <div
            className={`flex gap-3 overflow-x-auto scroll-smooth ${tw.scrollbarHide} pb-2`}
          >
            {relatedProducts.map((p) => {
              const pd = p.originalPrice
                ? Math.round(
                    ((p.originalPrice - p.price) / p.originalPrice) * 100
                  )
                : null;
              return (
                <div
                  key={p.id}
                  className="flex shrink-0 flex-col rounded-lg border border-gray-200 bg-white overflow-hidden"
                  style={{ width: "170px" }}
                >
                  <div className="relative h-[110px] bg-gray-50 flex items-center justify-center overflow-hidden">
                    {pd && (
                      <span
                        className="absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold text-white z-10"
                        style={{ background: "#a70a1cff" }}
                      >
                        -{pd}% OFF
                      </span>
                    )}
                    {p.isNew && (
                      <span
                        className="absolute right-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold text-white z-10"
                        style={{ background: "#10b981" }}
                      >
                        NEW
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onProductClick(p)}
                      className="p-3 w-full h-full flex items-center justify-center border-0 bg-transparent cursor-pointer"
                    >
                      <StoreImage
                        src={p.images[0]}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col px-2.5 pt-2 pb-2.5">
                    <div className="mb-0.5 text-[8px] font-bold uppercase tracking-widest text-gray-400">
                      {p.brand}
                    </div>
                    <div className="mb-1 flex items-center gap-px">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg
                          key={s}
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill={
                            s <= Math.round(p.rating) ? "#F59E0B" : "#D1D5DB"
                          }
                        >
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                      ))}
                      <span className="ml-0.5 text-[9px] font-bold text-amber-500">
                        {p.rating}
                      </span>
                      <span className="text-[9px] text-gray-400">
                        ({p.reviews})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onProductClick(p)}
                      className="mb-1 text-left border-0 bg-transparent cursor-pointer"
                    >
                      <span className="line-clamp-2 text-[11px] font-semibold leading-snug text-gray-800">
                        {p.name}
                      </span>
                    </button>
                    <span className="mb-0.5 text-[10px] font-semibold text-green-600">
                      In Stock
                    </span>
                    <div className="text-[13px] font-extrabold text-gray-900">
                      {fmt(p.price)}
                    </div>
                    {p.originalPrice && (
                      <div className="text-[10px] text-gray-400 line-through">
                        {fmt(p.originalPrice)}
                      </div>
                    )}
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
                        className="flex flex-1 items-center justify-center gap-1 rounded py-1.5 text-[10px] font-bold text-white cursor-pointer hover:opacity-90"
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
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-gray-200 bg-white cursor-pointer"
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill={
                            wishlist.some((w) => w.id === p.id)
                              ? "#ef4444"
                              : "none"
                          }
                          stroke={
                            wishlist.some((w) => w.id === p.id)
                              ? "#ef4444"
                              : "#9ca3af"
                          }
                          strokeWidth="2"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </LazyMount>
      </div>
    </div>
  );
}
