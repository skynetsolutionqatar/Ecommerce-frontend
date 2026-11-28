"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StoreImage from "@/components/StoreImage";
import { formatPrice } from "@/lib/utils";
import type { HeroSlide } from "@/types/storefront.types";

const GUTTER = 16;
const GAP = 12;
const AUTO_MS = 5200;
const POSTER_ASPECT = 1080 / 1350;

function posterUrl(slide: HeroSlide): string {
  return slide.isPoster ? slide.posterImgMobile?.trim() || slide.posterImg?.trim() || "" : "";
}

/** App home hero: snap carousel, neighbors scale down while scrolling, auto-advances. */
export default function MobileHomeHeroSlider({
  slides,
  loading,
  onPress,
}: {
  slides: HeroSlide[];
  loading?: boolean;
  onPress: (slide: HeroSlide) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [viewportH, setViewportH] = useState(800);

  const preferPoster = slides.some((slide) => Boolean(posterUrl(slide)));
  const interval = cardWidth + GAP;
  const posterHeight =
    cardWidth > 0
      ? Math.min(Math.round(cardWidth / POSTER_ASPECT), Math.max(Math.round(viewportH * 0.56), 300))
      : 360;
  const contentHeight = cardWidth > 0 ? (cardWidth < 328 ? 318 : cardWidth < 368 ? 336 : 352) : 336;
  const activeHeight = preferPoster ? posterHeight : contentHeight;

  const applyScale = useCallback(
    (left: number) => {
      if (!interval) return;
      cardRefs.current.forEach((node, i) => {
        if (!node) return;
        const dist = Math.min(Math.abs(left - i * interval) / interval, 1);
        node.style.transform = `scale(${1 - dist * 0.07})`;
        node.style.opacity = String(1 - dist * 0.1);
      });
    },
    [interval]
  );

  const scrollToIndex = useCallback(
    (next: number, animated = true) => {
      const el = scrollerRef.current;
      if (!el || !interval) return;
      const clamped = Math.max(0, Math.min(slides.length - 1, next));
      el.scrollTo({ left: clamped * interval, behavior: animated ? "smooth" : "auto" });
      indexRef.current = clamped;
      setIndex(clamped);
    },
    [interval, slides.length]
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const measure = () => {
      setCardWidth(Math.max(0, el.clientWidth - GUTTER * 2));
      setViewportH(window.innerHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [loading, slides.length]);

  useEffect(() => {
    if (cardWidth > 0) applyScale(scrollerRef.current?.scrollLeft ?? 0);
  }, [applyScale, cardWidth, slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      const next = (indexRef.current + 1) % slides.length;
      scrollToIndex(next);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [scrollToIndex, slides.length]);

  if (loading) {
    return (
      <div className="px-4">
        <div className="animate-pulse rounded-2xl bg-gray-200" style={{ height: activeHeight }} />
      </div>
    );
  }
  if (!slides.length) return null;

  return (
    <div className="flex flex-col gap-2.5" aria-label="Featured products">
      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(event) => {
            const left = event.currentTarget.scrollLeft;
            applyScale(left);
            if (!interval) return;
            const next = Math.max(0, Math.min(slides.length - 1, Math.round(left / interval)));
            if (next !== indexRef.current) {
              indexRef.current = next;
              setIndex(next);
            }
          }}
          onPointerDown={() => {
            pausedRef.current = true;
          }}
          onPointerUp={() => {
            pausedRef.current = false;
          }}
        >
          {slides.map((slide, i) => {
            const poster = posterUrl(slide);
            const height = poster ? posterHeight : contentHeight;
            return (
              <div
                key={slide.id}
                ref={(node) => {
                  cardRefs.current[i] = node;
                }}
                className="shrink-0 snap-center"
                style={{ width: cardWidth || "100%" }}
              >
                <button
                  type="button"
                  onClick={() => onPress(slide)}
                  className="block w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 text-left shadow-[0_10px_18px_rgba(14,27,51,0.1)]"
                  style={{ height, background: slide.surfaceColor || undefined }}
                >
                  {poster ? (
                    <StoreImage
                      src={poster}
                      alt=""
                      fit="cover"
                      blend={false}
                      className="h-full w-full object-cover"
                      priority={i === 0}
                    />
                  ) : (
                    <span className="flex h-full flex-col gap-3 px-4 py-4">
                      <span className="line-clamp-2 text-[20px] font-extrabold leading-6 text-gray-900">
                        {slide.title.replace(/\n/g, " ").trim()}
                      </span>
                      {slide.img ? (
                        <StoreImage src={slide.img} alt="" className="min-h-0 flex-1 object-contain" />
                      ) : (
                        <span className="flex-1" />
                      )}
                      {slide.price != null && slide.price > 0 ? (
                        <span className="text-[22px] font-extrabold text-gray-900">
                          {formatPrice(slide.price)}
                        </span>
                      ) : null}
                      <span className="inline-flex w-fit rounded-lg bg-[#0a255d] px-4 py-2 text-sm font-bold text-white">
                        {slide.cta?.trim() || "Shop now"}
                      </span>
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
        {slides.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => {
                pausedRef.current = true;
                scrollToIndex(index === 0 ? slides.length - 1 : index - 1);
              }}
              className="absolute left-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-0 bg-white shadow-md"
              style={{ top: activeHeight / 2 - 18 }}
            >
              <ChevronLeft className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => {
                pausedRef.current = true;
                scrollToIndex((index + 1) % slides.length);
              }}
              className="absolute right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-0 bg-white shadow-md"
              style={{ top: activeHeight / 2 - 18 }}
            >
              <ChevronRight className="h-[18px] w-[18px]" />
            </button>
          </>
        ) : null}
      </div>
      {slides.length > 1 ? (
        <div className="flex justify-center gap-1.5" aria-label={`Slide ${index + 1} of ${slides.length}`}>
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => {
                pausedRef.current = true;
                scrollToIndex(i);
              }}
              className="h-1.5 rounded-full border-0 bg-[#0a255d] p-0 transition-[width] duration-200"
              style={{ width: i === index ? 20 : 6, opacity: i === index ? 1 : 0.35 }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
