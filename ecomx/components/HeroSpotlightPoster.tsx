"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Flame, Tag } from "lucide-react";
import StoreImage from "@/components/StoreImage";
import {
  buildHeroSpotlightItems,
  SPOTLIGHT_COUPON_SURFACE,
  type HeroSpotlightItem,
} from "@/lib/store/hero-spotlight";
import { shopDealsUrl } from "@/lib/store/mobile-chrome";
import { apiProductDiscountPercent, apiProductImage } from "@/lib/store/api-product-display";
import { productImageSurfaceClass } from "@/lib/store/product-image-utils";
import { shopUrl } from "@/lib/routes";
import { Colors, tw } from "@/lib/theme";
import { formatPrice } from "@/lib/utils";
import type { ApiProduct } from "@/types/product.types";
import type { HeroSlide } from "@/types/storefront.types";
import { useRouter } from "next/navigation";

const ROTATE_MS = 4500;
const HOT_DEALS_SUBTITLE = "Printers, scanners, POS & more";
/** Upper bound. The list only renders as many full rows as fit under the slider. */
const COLUMN_DEAL_LIMIT = 8;

const DEAL_CYCLE_MS = 6400;
const DEAL_EASE = [0.22, 1, 0.36, 1] as const;

function windowedDeals(pool: ApiProduct[], start: number, count: number) {
  if (pool.length === 0 || count <= 0) return [];
  const size = Math.min(count, pool.length);
  const origin = ((start % pool.length) + pool.length) % pool.length;
  return Array.from({ length: size }, (_, i) => pool[(origin + i) % pool.length]);
}

function CouponNotch({ side, fill }: { side: "left" | "right"; fill: string }) {
  const pos = side === "left" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2";
  return (
    <span
      className={`absolute top-1/2 z-20 h-4 w-4 -translate-y-1/2 rounded-full border border-dashed ${pos}`}
      style={{ borderColor: fill, background: "#f1f5f9" }}
      aria-hidden
    />
  );
}

function HeroDealCoupon({
  item,
  reduceMotion,
  onClick,
}: {
  item: HeroSpotlightItem;
  reduceMotion: boolean;
  onClick: () => void;
}) {
  const isDay = item.frame === "day";
  const surface = SPOTLIGHT_COUPON_SURFACE[item.frame];

  const body = (
    <>
      {reduceMotion ? null : (
        <motion.span
          className="pointer-events-none absolute inset-y-0 z-[1] w-1/2"
          style={{
            background:
              "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.15) 35%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.15) 65%, transparent 100%)",
          }}
          initial={{ x: "-130%" }}
          animate={{ x: "280%" }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut" }}
          aria-hidden
        />
      )}
      <motion.span
        className="pointer-events-none absolute -right-4 -top-6 h-20 w-20 rounded-full blur-2xl"
        style={{ background: surface.mesh }}
        animate={reduceMotion ? undefined : { opacity: [0.55, 1, 0.55], scale: [1, 1.12, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <span className="relative z-[2] flex h-full w-full flex-col items-center justify-center px-2.5 py-1 text-center">
        <CouponNotch side="left" fill={surface.border} />
        <CouponNotch side="right" fill={surface.border} />
        <span
          className="font-label text-[11px] font-bold uppercase tracking-[0.16em]"
          style={{ color: surface.accent }}
        >
          {isDay ? "Deal of the Day" : "Limited offer"}
        </span>
        <span className="font-display mt-1 text-[clamp(1.45rem,2vw,1.85rem)] font-extrabold leading-none text-slate-900">
          {isDay ? "Up to " : "Save "}
          <motion.span
            className="inline-block"
            style={{ color: surface.accent }}
            animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            {item.percent}%
          </motion.span>
        </span>
        <span className="font-display mt-1 line-clamp-1 w-full text-[clamp(0.95rem,1.2vw,1.125rem)] font-semibold leading-tight text-slate-600">
          {item.name}
        </span>
        <motion.span
          className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-label text-xs font-semibold"
          style={{
            color: surface.accent,
            border: `1px dashed ${surface.border}`,
            background: "rgba(255,255,255,0.55)",
          }}
          whileHover={reduceMotion ? undefined : { scale: 1.03 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        >
          <Tag className="h-2.5 w-2.5 opacity-80" strokeWidth={2.2} aria-hidden />
          Shop deals
        </motion.span>
      </span>
    </>
  );

  const className =
    "relative h-full max-h-full w-full overflow-hidden rounded-xl border border-dashed";

  const style = {
    background: surface.gradient,
    borderColor: surface.border,
    boxShadow: surface.shadow,
  };

  if (reduceMotion) {
    return (
      <button type="button" onClick={onClick} className={className} style={style}>
        {body}
      </button>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.button
        key={item.id}
        type="button"
        onClick={onClick}
        initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{
          scale: 1.012,
          boxShadow: `${surface.shadow}, 0 10px 28px rgba(15,23,42,0.08)`,
        }}
        whileTap={{ scale: 0.995 }}
        className={className}
        style={style}
        aria-label={
          isDay
            ? `Deal of the day, ${item.percent}% off ${item.name}`
            : `Up to ${item.percent}% off ${item.name}`
        }
      >
        {body}
      </motion.button>
    </AnimatePresence>
  );
}

function HeroSpotlightDealRow({
  product,
  onPress,
}: {
  product: ApiProduct;
  onPress: (product: ApiProduct) => void;
}) {
  const discount = apiProductDiscountPercent(product);
  const image = apiProductImage(product);

  const row = (
    <button
      type="button"
      onClick={() => onPress(product)}
      data-deal-row
      className="flex w-full min-w-0 items-center gap-2.5 rounded-lg border border-white/10 bg-white/95 px-2 py-1.5 text-left shadow-[0_1px_5px_rgba(8,20,45,0.12)]"
    >
      <span
        className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-md p-0.5 ${productImageSurfaceClass}`}
      >
        {image ? (
          <StoreImage src={image} alt="" className="h-full w-full object-contain mix-blend-multiply" />
        ) : null}
        {discount > 0 ? (
          <span className="absolute left-0 top-0 rounded-br bg-[#9f3d52]/90 px-1 py-0.5 font-label text-[10px] font-bold text-white">
            -{discount}%
          </span>
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-1 text-[13px] font-semibold leading-snug text-gray-800">
          {product.name}
        </span>
        <span className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-sm font-extrabold text-gray-900">{formatPrice(product.price)}</span>
          {product.compareAtPrice != null && product.compareAtPrice > product.price ? (
            <span className="text-[11px] text-gray-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );

  return row;
}

function HeroSpotlightHotDeals({
  products,
  isLoading,
  onProductClick,
  reduceMotion,
  paused,
}: {
  products: ApiProduct[];
  isLoading?: boolean;
  onProductClick?: (product: ApiProduct) => void;
  reduceMotion: boolean;
  paused?: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const pool = products.slice(0, COLUMN_DEAL_LIMIT);
  const [visibleCount, setVisibleCount] = useState(4);
  const [start, setStart] = useState(0);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el || isLoading || pool.length === 0) return;

    const measure = () => {
      const available = el.clientHeight;
      const row = el.querySelector<HTMLElement>("[data-deal-row]");
      const rowH = row?.offsetHeight ?? 52;
      const gap = 4;
      const fit = Math.max(1, Math.floor((available + gap) / (rowH + gap)));
      const next = Math.min(pool.length, fit);
      setVisibleCount((prev) => (prev === next ? prev : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoading, pool.length]);

  const visible = windowedDeals(pool, start, visibleCount);

  useEffect(() => {
    if (reduceMotion || paused || pool.length <= visibleCount) return;
    const id = window.setInterval(() => {
      setStart((current) => (current - 1 + pool.length) % pool.length);
    }, DEAL_CYCLE_MS);
    return () => window.clearInterval(id);
  }, [paused, pool.length, reduceMotion, visibleCount]);

  return (
    <motion.section
      className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl shadow-[0_8px_28px_rgba(10,37,93,0.22)]"
      style={{ background: Colors.base_color }}
      initial={reduceMotion ? false : { opacity: 0.92 }}
      animate={{ opacity: 1 }}
      aria-labelledby="hero-hot-deals-title"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 100% 0%, rgba(255,255,255,0.16) 0%, transparent 55%)",
        }}
        animate={reduceMotion ? undefined : { opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <div className="relative shrink-0 px-2.5 pb-1 pt-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <motion.span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300/90"
              animate={reduceMotion ? undefined : { scale: [1, 1.06, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Flame className="h-3 w-3 fill-amber-300/80 text-amber-300/80" aria-hidden />
            </motion.span>
            <h2 id="hero-hot-deals-title" className="font-display truncate text-base font-extrabold text-white">
              Hot deals
            </h2>
          </div>
          <Link
            href={shopDealsUrl()}
            className="shrink-0 rounded-md bg-white/95 px-2.5 py-1 font-label text-xs font-extrabold text-[#9f3d52] shadow-sm transition hover:bg-white"
          >
            View all
          </Link>
        </div>
        <p className="mt-0.5 line-clamp-1 font-label text-xs font-medium text-white/75">
          {HOT_DEALS_SUBTITLE}
        </p>
      </div>

      <div ref={listRef} className={`relative min-h-0 flex-1 overflow-hidden px-2.5 pb-2 pt-0.5 ${tw.scrollbarHide}`}>
        {isLoading ? (
          <div className="flex flex-col gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 shrink-0 animate-pulse rounded-lg bg-white/10" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((product) => (
                <motion.div
                  key={product._id}
                  layout
                  className="shrink-0"
                  initial={reduceMotion ? false : { y: "-130%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ x: "120%", opacity: 0 }}
                  transition={{
                    y: { duration: 1.25, ease: DEAL_EASE },
                    x: { duration: 1.15, ease: DEAL_EASE },
                    opacity: { duration: 1 },
                    layout: { duration: 1.05, ease: DEAL_EASE },
                  }}
                >
                  <HeroSpotlightDealRow
                    product={product}
                    onPress={(p) => onProductClick?.(p)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.section>
  );
}

export default function HeroSpotlightPoster({
  slides,
  dealProducts,
  isLoading,
  onViewAll,
  onProductClick,
  className = "",
}: {
  slides?: HeroSlide[];
  dealProducts?: ApiProduct[];
  isLoading?: boolean;
  onSlideAction?: (slide: HeroSlide) => void;
  onViewAll?: () => void;
  onProductClick?: (product: ApiProduct) => void;
  className?: string;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion() === true;
  const items = useMemo(
    () => buildHeroSpotlightItems(slides ?? [], dealProducts ?? []),
    [slides, dealProducts]
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const safeIndex = items.length === 0 ? 0 : index % items.length;

  useEffect(() => {
    if (reduceMotion || paused || items.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [items.length, paused, reduceMotion]);

  const active = items[safeIndex];

  const handleCouponClick = useCallback(
    (item: HeroSpotlightItem) => {
      if (item.categorySlug) {
        router.push(shopUrl({ listing: true, categoryId: item.categorySlug, hasDiscount: true }));
        return;
      }
      onViewAll?.();
    },
    [onViewAll, router]
  );

  const shell = `relative hidden h-full min-h-0 max-h-full overflow-hidden md:flex md:flex-col md:justify-start md:gap-3 ${className}`;

  if (isLoading) {
    return (
      <div className={shell} aria-hidden>
        <div className="h-[6.25rem] shrink-0 animate-pulse rounded-xl bg-slate-200/70" />
        <div className="min-h-0 flex-1 animate-pulse rounded-2xl bg-slate-300/60" />
      </div>
    );
  }

  if (!active && (dealProducts?.length ?? 0) === 0) return null;

  return (
    <div
      className={shell}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="h-[6.25rem] shrink-0 md:h-[6.75rem] lg:h-[7.25rem]">
        {active ? (
          <HeroDealCoupon
            item={active}
            reduceMotion={reduceMotion}
            onClick={() => handleCouponClick(active)}
          />
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <HeroSpotlightHotDeals
          products={dealProducts ?? []}
          isLoading={isLoading}
          onProductClick={onProductClick}
          reduceMotion={reduceMotion}
          paused={paused}
        />
      </div>
    </div>
  );
}