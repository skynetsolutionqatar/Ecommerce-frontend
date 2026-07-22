"use client";
import { useState, useEffect } from "react";
import { fmt } from "@/lib/data";
import { tw, badgeBgClass, swatchBgClass, type } from "@/lib/theme";
import StoreImage from "./StoreImage";
import type { Product, WishlistItem } from "@/lib/types";
import * as Icons from "./Icons";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, color: string, size: string) => void;
  onWishlistToggle: (item: WishlistItem) => void;
  isWishlisted: boolean;
}

export default function ProductModal({ product, onClose, onAddToCart, onWishlistToggle, isWishlisted }: ProductModalProps) {
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] ?? { name: "", hex: "" });
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    if (!product) return;
    setImgIdx(0);
    setSelectedColor(product.colors[0]);
    setSelectedSize("");
    setAdded(false);
    setSizeError(false);
  }, [product]);

  if (!product) return null;

  const handleAdd = () => {
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    onAddToCart(product, selectedColor.name, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/65 backdrop-blur-md p-6 animate-fade-in"
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`${tw.glassCard} grid w-full max-w-[960px] max-h-[90vh] grid-cols-1 md:grid-cols-2 overflow-auto rounded-[32px] animate-fade-up ${tw.scrollbarThin}`}
      >
        <div className="relative min-h-[480px] overflow-hidden rounded-t-[32px] md:rounded-l-[32px] md:rounded-tr-none bg-bg-soft">
          <StoreImage src={product.images[imgIdx] || product.images[0]} alt={product.name} className="block h-full w-full object-cover" />
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setImgIdx(i)}
                className={`h-12 w-12 overflow-hidden rounded-[10px] border-0 p-0 cursor-pointer ${
                  imgIdx === i ? "outline outline-2 outline-primary outline-offset-0" : "outline-none"
                }`}
              >
                <StoreImage src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="absolute top-5 left-5">
            <span className={`rounded-full px-3.5 py-1 text-[11px] font-bold tracking-wide text-white ${badgeBgClass(product.badge)}`}>
              {product.badge}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 px-8 py-11 md:px-10">
          <div className="flex items-start justify-between">
            <div>
              <div className={`mb-2 ${type.eyebrow} text-[11px] tracking-[0.12em] text-accent`}>{product.brand}</div>
              <h2 className="font-display text-[32px] font-bold leading-tight text-primary">{product.name}</h2>
            </div>
            <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-0 bg-bg-soft text-muted cursor-pointer">
              <Icons.X />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 text-accent">
              {[1, 2, 3, 4, 5].map(i => <Icons.Star key={i} filled={i <= Math.round(product.rating)} />)}
            </div>
            <span className="text-[13px] text-muted">{product.rating} · {product.reviews.toLocaleString()} reviews</span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`${type.price} text-[28px] font-extrabold text-primary`}>{fmt(product.price)}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-muted line-through">{fmt(product.originalPrice)}</span>
                <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[13px] font-bold text-white">
                  SAVE {fmt(product.originalPrice - product.price)}
                </span>
              </>
            )}
          </div>

          <p className="text-[15px] leading-relaxed text-primary/80">{product.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {product.tags.map(t => (
              <span key={t} className="rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold text-primary">{t}</span>
            ))}
          </div>

          <div>
            <div className="mb-2.5 text-[13px] font-semibold text-primary/80">
              Color: <span className="text-primary">{selectedColor.name}</span>
            </div>
            <div className="flex gap-2">
              {product.colors.map(c => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  title={c.name}
                  className={`h-7 w-7 rounded-full border-0 cursor-pointer transition-all ${swatchBgClass(c.hex)} ${
                    selectedColor.name === c.name ? "ring-2 ring-primary ring-offset-2" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2.5 flex justify-between">
              <span className="text-[13px] font-semibold text-primary/80">
                Size: {selectedSize ? <span className="text-primary">US {selectedSize}</span> : (
                  <span className={sizeError ? "text-red-500" : "text-muted"}>
                    {sizeError ? "Please select a size" : "Select a size"}
                  </span>
                )}
              </span>
              <a href="#" className="text-xs text-accent underline">Size Guide</a>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setSelectedSize(s); setSizeError(false); }}
                  className={`h-12 w-12 rounded-xl text-[13px] font-semibold cursor-pointer transition-all ${
                    selectedSize === s
                      ? "border-2 border-primary bg-primary text-white"
                      : sizeError
                        ? "border border-red-500 bg-white text-primary/80"
                        : "border border-border bg-white text-primary/80"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              className={`${tw.btnPrimary} flex-1 justify-center py-4 text-[15px] ${added ? "!bg-gray-700" : ""}`}
              onClick={handleAdd}
            >
              {added ? <><Icons.Check /> Added to Cart!</> : "Add to Cart"}
            </button>
            <button
              type="button"
              onClick={() => onWishlistToggle({ id: product.id, name: product.name, brand: product.brand, price: product.price, img: product.images[0] })}
              className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border-2 border-border bg-white cursor-pointer transition-colors ${
                isWishlisted ? "text-red-500" : "text-muted"
              }`}
              aria-label="Wishlist"
            >
              <Icons.Heart filled={isWishlisted} />
            </button>
          </div>

          <div className="flex gap-5 border-t border-border pt-4">
            {[["🚚", "Free installation"], ["↩️", "1-year warranty"], ["🌱", "Qatar VAT certified"]].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-muted">
                <span>{icon}</span> {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
