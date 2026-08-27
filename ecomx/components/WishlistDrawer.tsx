"use client";

import { fmt } from "@/lib/data";
import { Colors, tw } from "@/lib/theme";
import type { WishlistItem } from "@/lib/types";
import { productImageSurfaceClass } from "@/lib/store/product-image-utils";
import StoreImage from "./StoreImage";
import * as Icons from "./Icons";

interface WishlistDrawerProps {
  wishlist: WishlistItem[];
  open: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
  onAddToCart: (item: WishlistItem) => void;
}

const closeBtnClass =
  "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-[#0a255d]/30 hover:bg-gray-50 hover:text-[#0a255d]";

const primaryBtnSmClass =
  "inline-flex items-center justify-center gap-1 rounded-lg px-3.5 py-2.5 md:py-2 text-sm md:text-xs font-semibold text-white transition hover:opacity-90";

const removeBtnClass =
  "inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 md:py-2 text-sm md:text-xs font-semibold text-gray-600 transition hover:border-[#0a255d]/40 hover:text-[#0a255d]";

export default function WishlistDrawer({
  wishlist,
  open,
  onClose,
  onRemove,
  onAddToCart,
}: WishlistDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300]">
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="absolute top-0 right-0 bottom-0 flex w-full max-w-[420px] flex-col bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.15)] animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-2.5 text-gray-900">
            <Icons.Heart filled />
            <span className="text-base font-bold">Wishlist</span>
            {wishlist.length > 0 ? (
              <span
                className="rounded-full px-2.5 py-0.5 text-sm md:text-xs font-bold text-white"
                style={{ background: Colors.base_color }}
              >
                {wishlist.length}
              </span>
            ) : null}
          </div>
          <button type="button" onClick={onClose} className={closeBtnClass} aria-label="Close wishlist">
            <Icons.X />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto p-6 ${tw.scrollbarThin}`}>
          {wishlist.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div
                className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-white"
                style={{ background: Colors.base_color }}
              >
                <Icons.Heart filled />
              </div>
              <p className="mb-2 font-semibold text-gray-900">Nothing saved yet</p>
              <p className="text-[13px] text-gray-500">Heart items you love to save them here</p>
            </div>
          ) : (
            wishlist.map((item) => (
              <div
                key={item.id}
                className="mb-4 flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className={`h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl ${productImageSurfaceClass}`}>
                  <StoreImage src={item.img} alt={item.name} className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 text-[12px] md:text-[11px] text-gray-500">{item.brand}</div>
                  <div className="mb-2 text-sm font-semibold text-gray-900">{item.name}</div>
                  <div className="mb-3 font-mono text-[13px] font-bold text-[#0a255d]">{fmt(item.price)}</div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      className={`${primaryBtnSmClass} w-full sm:flex-1`}
                      style={{ background: Colors.base_color }}
                      onClick={() => onAddToCart(item)}
                    >
                      Add to Cart
                    </button>
                    <button type="button" className={removeBtnClass} onClick={() => onRemove(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
