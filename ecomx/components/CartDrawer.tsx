"use client";
import { fmt } from "@/lib/data";
import { tw, type } from "@/lib/theme";
import type { CartItem } from "@/lib/types";
import * as Icons from "./Icons";

interface CartDrawerProps {
  cart: CartItem[];
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  setPage: (p: string) => void;
}

export default function CartDrawer({ cart, open, onClose, onUpdate, onRemove, setPage }: CartDrawerProps) {
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const ship = 0;
  const total = sub + ship;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300]">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div className="absolute top-0 right-0 bottom-0 flex w-full max-w-[420px] flex-col bg-bg shadow-[-20px_0_60px_rgba(0,0,0,0.15)] animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-2.5">
            <Icons.Bag />
            <span className="text-base font-bold">Your Cart</span>
            {cart.length > 0 && (
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </div>
          <button type="button" onClick={onClose} className="border-0 bg-transparent p-1 text-muted cursor-pointer">
            <Icons.X />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto p-6 ${tw.scrollbarThin}`}>
          {cart.length === 0 ? (
            <div className="px-6 py-15 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft shadow-[inset_2px_2px_6px_color-mix(in_srgb,var(--color-primary)_8%,transparent)]">
                <Icons.Bag />
              </div>
              <p className="mb-2 font-semibold text-primary">Your cart is empty</p>
              <p className="mb-6 text-[13px] text-muted">Discover something you&apos;ll love</p>
              <button type="button" className={tw.btnPrimary} onClick={onClose}>Browse Shop</button>
            </div>
          ) : cart.map(item => (
            <div key={item.id} className={`mb-5 flex gap-4 ${tw.card} p-4`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.img} alt={item.name} className="h-20 w-20 shrink-0 rounded-[14px] object-cover bg-bg-soft" />
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 text-[13px] text-muted">{item.brand}</div>
                <div className="text-sm font-semibold leading-snug text-primary">{item.name}</div>
                {item.color && <div className="mt-0.5 text-xs text-muted">{item.color}{item.size && ` · Size ${item.size}`}</div>}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center overflow-hidden rounded-full border border-border">
                    <button type="button" onClick={() => onUpdate(item.id, item.qty - 1)} className="flex h-8 w-8 items-center justify-center border-0 bg-transparent text-muted cursor-pointer">
                      <Icons.Minus />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold">{item.qty}</span>
                    <button type="button" onClick={() => onUpdate(item.id, item.qty + 1)} className="flex h-8 w-8 items-center justify-center border-0 bg-transparent text-primary cursor-pointer">
                      <Icons.Plus />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`${type.price} font-bold text-primary`}>{fmt(item.price * item.qty)}</span>
                    <button type="button" onClick={() => onRemove(item.id)} className="border-0 bg-transparent p-1 text-muted cursor-pointer hover:text-red-500 transition-colors">
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-border p-6">
            <div className="mb-4 rounded-xl bg-accent-soft px-3.5 py-2.5 text-xs text-primary">
              🎉 Free installation &amp; delivery included on all orders!
            </div>
            <div className="mb-4">
              {([["Subtotal", fmt(sub)], ["Shipping", "FREE"], ["Total", fmt(total)]] as [string, string][]).map(([label, val], i) => (
                <div key={label} className={`flex justify-between py-1.5 ${i === 2 ? "mt-2 border-t border-border pt-2" : ""}`}>
                  <span className={`${i === 2 ? "text-[15px] font-bold text-primary" : "text-[13px] text-muted"}`}>{label}</span>
                  <span className={`${i === 2 ? "text-[15px] font-bold text-primary" : "text-[13px] font-medium"} ${i === 1 ? "text-gray-600" : "text-primary/80"}`}>{val}</span>
                </div>
              ))}
            </div>
            <button type="button" className={`${tw.btnPrimary} w-full justify-center mb-2.5`} onClick={() => { onClose(); setPage("checkout"); }}>
              Checkout · {fmt(total)} <Icons.ArrowRight />
            </button>
            <button type="button" className={`${tw.btnOutline} w-full justify-center`} onClick={() => { onClose(); setPage("cart"); }}>
              View Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
