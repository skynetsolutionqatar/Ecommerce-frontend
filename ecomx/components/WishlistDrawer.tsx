"use client";
import { fmt } from "@/lib/data";
import { tw, type } from "@/lib/theme";
import type { WishlistItem } from "@/lib/types";
import * as Icons from "./Icons";

interface WishlistDrawerProps {
  wishlist: WishlistItem[];
  open: boolean;
  onClose: () => void;
  onRemove: (id: number) => void;
  onAddToCart: (item: WishlistItem) => void;
}

export default function WishlistDrawer({ wishlist, open, onClose, onRemove, onAddToCart }: WishlistDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300]">
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="absolute top-0 right-0 bottom-0 flex w-full max-w-[420px] flex-col bg-bg shadow-[-20px_0_60px_rgba(0,0,0,0.15)] animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-2.5">
            <Icons.Heart filled />
            <span className="text-base font-bold">Wishlist</span>
            {wishlist.length > 0 && (
              <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </div>
          <button type="button" onClick={onClose} className="border-0 bg-transparent text-muted cursor-pointer">
            <Icons.X />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto p-6 ${tw.scrollbarThin}`}>
          {wishlist.length === 0 ? (
            <div className="px-6 py-15 text-center">
              <div className="mb-4 text-5xl">🤍</div>
              <p className="mb-2 font-semibold text-primary">Nothing saved yet</p>
              <p className="text-[13px] text-muted">Heart items you love to save them here</p>
            </div>
          ) : wishlist.map(item => (
            <div key={item.id} className={`mb-4 flex gap-4 ${tw.card} p-4`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.img} alt={item.name} className="h-[72px] w-[72px] shrink-0 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="mb-1 text-sm font-semibold text-primary">{item.name}</div>
                <div className={`mb-2.5 ${type.price} text-[13px] font-bold text-accent`}>{fmt(item.price)}</div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button type="button" className={`${tw.btnPrimarySm} w-full min-w-0 justify-center px-3 py-2 sm:flex-1 sm:px-3.5`} onClick={() => onAddToCart(item)}>
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="shrink-0 rounded-full border border-border bg-transparent px-3 py-2 text-xs text-muted cursor-pointer hover:border-red-300 hover:text-red-500 sm:px-2.5"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
