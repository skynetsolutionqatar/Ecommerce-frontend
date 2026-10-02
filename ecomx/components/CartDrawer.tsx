"use client";

import { useRouter } from "next/navigation";
import { fmt } from "@/lib/data";
import { ROUTES } from "@/lib/routes";
import { Colors, tw } from "@/lib/theme";
import type { CartItem } from "@/lib/types";
import { productImageSurfaceClass } from "@/lib/store/product-image-utils";
import StoreImage from "./StoreImage";
import * as Icons from "./Icons";

interface CartDrawerProps {
  cart: CartItem[];
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

const closeBtnClass =
  "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-[#0a255d]/30 hover:bg-gray-50 hover:text-[#0a255d]";

const primaryBtnClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white transition hover:opacity-90";

const outlineBtnClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:border-[#0a255d]/40 hover:text-[#0a255d]";

export default function CartDrawer({
  cart,
  open,
  onClose,
  onUpdate,
  onRemove,
}: CartDrawerProps) {
  const router = useRouter();
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = sub;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300]">
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="absolute top-0 right-0 bottom-0 flex w-full max-w-[420px] flex-col bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.15)] animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-2.5 text-gray-900">
            <Icons.Bag />
            <span className="text-base font-bold">Your Cart</span>
            {cart.length > 0 ? (
              <span
                className="rounded-full px-2.5 py-0.5 text-sm md:text-xs font-bold text-white"
                style={{ background: Colors.base_color }}
              >
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            ) : null}
          </div>
          <button type="button" onClick={onClose} className={closeBtnClass} aria-label="Close cart">
            <Icons.X />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto p-6 ${tw.scrollbarThin}`}>
          {cart.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div
                className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-white"
                style={{ background: Colors.base_color }}
              >
                <Icons.Bag />
              </div>
              <p className="mb-2 font-semibold text-gray-900">Your cart is empty</p>
              <p className="mb-6 text-[13px] text-gray-500">Discover something you&apos;ll love</p>
              <button
                type="button"
                className={primaryBtnClass}
                style={{ background: Colors.base_color, width: "auto" }}
                onClick={onClose}
              >
                Browse Shop
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const atMaxStock = item.stock != null && item.qty >= item.stock;

              return (
              <div key={item.id} className="mb-5 flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl ${productImageSurfaceClass}`}>
                  <StoreImage src={item.img} alt={item.name} className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 text-[13px] text-gray-500">{item.brand}</div>
                  <div className="text-sm font-semibold leading-snug text-gray-900">{item.name}</div>
                  {item.color ? (
                    <div className="mt-0.5 text-sm md:text-xs text-gray-500">
                      {item.color}
                      {item.size ? ` · Size ${item.size}` : ""}
                    </div>
                  ) : null}
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
                        <button
                          type="button"
                          onClick={() => onUpdate(item.id, item.qty - 1)}
                          className="flex h-9 w-9 md:h-8 md:w-8 items-center justify-center border-0 bg-white text-gray-500 cursor-pointer hover:text-[#0a255d]"
                        >
                          <Icons.Minus />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-gray-900">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => onUpdate(item.id, item.qty + 1)}
                          disabled={atMaxStock}
                          className="flex h-9 w-9 md:h-8 md:w-8 items-center justify-center border-0 bg-white cursor-pointer hover:text-[#0a255d] disabled:cursor-not-allowed disabled:opacity-40"
                          style={{ color: atMaxStock ? undefined : Colors.base_color }}
                          aria-label={atMaxStock ? "Maximum stock reached" : "Increase quantity"}
                        >
                          <Icons.Plus />
                        </button>
                      </div>
                      {atMaxStock ? (
                        <p className="mt-1 text-[12px] md:text-[11px] font-medium text-orange-600">
                          Only {item.stock} available in stock
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-gray-900">
                        {fmt(item.price * item.qty)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="flex h-9 w-9 md:h-8 md:w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 cursor-pointer transition hover:border-red-200 hover:text-red-500"
                        aria-label="Remove item"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
            })
          )}
        </div>

        {cart.length > 0 ? (
          <div className="border-t border-gray-200 p-6">
            <div
              className="mb-4 rounded-xl px-3.5 py-2.5 text-sm md:text-xs text-white"
              style={{ background: Colors.base_color }}
            >
              🎉 Free installation &amp; delivery included on all orders!
            </div>
            <div className="mb-4">
              {(
                [
                  ["Subtotal", fmt(sub)],
                  ["Delivery charge", "FREE"],
                  ["Total", fmt(total)],
                ] as [string, string][]
              ).map(([label, val], i) => (
                <div
                  key={label}
                  className={`flex justify-between py-1.5 ${i === 2 ? "mt-2 border-t border-gray-200 pt-2" : ""}`}
                >
                  <span
                    className={
                      i === 2 ? "text-[15px] font-bold text-gray-900" : "text-[13px] text-gray-500"
                    }
                  >
                    {label}
                  </span>
                  <span
                    className={
                      i === 2
                        ? "text-[15px] font-bold text-gray-900"
                        : i === 1
                          ? "text-[13px] font-medium text-green-600"
                          : "text-[13px] font-medium text-gray-800"
                    }
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className={`${primaryBtnClass} mb-2.5`}
              style={{ background: Colors.base_color }}
              onClick={() => {
                onClose();
                router.push(ROUTES.checkout);
              }}
            >
              Checkout · {fmt(total)} <Icons.ArrowRight />
            </button>
            <button type="button" className={outlineBtnClass} onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
