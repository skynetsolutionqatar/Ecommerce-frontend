"use client";
import { fmt } from "@/lib/data";
import { tw, type } from "@/lib/theme";
import StoreImage from "./StoreImage";
import type { Product } from "@/lib/types";
import * as Icons from "./Icons";

interface DealCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export default function DealCard({ product, onClick }: DealCardProps) {
  const discountPct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden ${tw.card} ${tw.cardHover} cursor-pointer`}
      onClick={() => onClick(product)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-soft">
        <StoreImage
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {discountPct && (
          <span className={`absolute left-2 top-2 ${tw.saleBadge} text-[10px]`}>
            −{discountPct}%
          </span>
        )}
        {product.badge && (
          <span className={`absolute right-2 top-2 rounded-md bg-primary-mid px-2 py-0.5 ${type.eyebrow} text-[10px] font-bold text-white`}>
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 md:p-4">
        <p className={`mb-0.5 ${type.eyebrow} text-xs tracking-wider text-accent`}>
          {product.brand}
        </p>
        <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] font-display text-lg font-semibold leading-snug text-primary">
          {product.name}
        </h3>

        <div className="mb-2 flex items-center gap-1">
          <div className="flex gap-0.5 text-accent">
            {[1, 2, 3, 4, 5].map(i => (
              <Icons.Star key={i} filled={i <= Math.round(product.rating)} />
            ))}
          </div>
          <span className="text-[11px] text-muted">({product.rating})</span>
        </div>

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className={`${type.price} text-md font-bold text-primary`}>{fmt(product.price)}</span>
          {product.originalPrice && (
            <span className={`${type.price} text-xs text-muted line-through`}>{fmt(product.originalPrice)}</span>
          )}
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2.5">
          <span className="text-[11px] font-medium text-gray-500">Free delivery</span>
          <span className="text-[11px] font-semibold text-accent group-hover:underline">
            View deal →
          </span>
        </div>
      </div>
    </article>
  );
}
