"use client";

import type { ReactNode } from "react";
import { ShoppingCart } from "lucide-react";

export default function MobileTabTitleHeader({
  title,
  children,
  cartCount,
  onCartOpen,
}: {
  title: string;
  children?: ReactNode;
  cartCount: number;
  onCartOpen: () => void;
}) {
  return (
    <header
      className="bg-[#f1f3f6] px-4 pb-3.5"
      style={{ paddingTop: "max(10px, env(safe-area-inset-top))" }}
    >
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[26px] font-extrabold leading-8 text-gray-900">{title}</h1>
        <button
          type="button"
          onClick={onCartOpen}
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-[#0a255d] shadow-sm"
          aria-label="Open cart"
        >
          <ShoppingCart className="h-5 w-5" strokeWidth={1.9} />
          {cartCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-black text-white">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          ) : null}
        </button>
      </div>
      {children ? <div className="mt-3 flex flex-col gap-3">{children}</div> : null}
    </header>
  );
}