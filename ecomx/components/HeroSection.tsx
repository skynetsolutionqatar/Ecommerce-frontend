"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import StoreImage from "./StoreImage";
import { tw, type } from "@/lib/theme";
import {
  formatHeroTitle,
  getSlideAccent,
  getEyebrowBadgeStyle,
  getHeroImageClass,
  HERO_IMAGE_INNER,
  HERO_SLIDE_MIN_H,
  getHeroSurfaceStyle,
  getHeroMeshOrbs,
  getHeroAuroraGradient,
  getHeroBeamGradient,
  buildHeroSlides,
  HERO_TRUST_BADGES,
  HERO_SLIDE_LABELS,
  type HeroAccent,
} from "@/lib/store/hero-utils";
import {
  animate,
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  AnimatePresence,
  MotionConfig,
  type MotionValue,
  type Transition,
  type Variants,
  type PanInfo,
} from "framer-motion";
import type { HeroSlide } from "@/types/storefront.types";

const AUTO_MS = 5500;
const SLIDE_COUNT = 4;
const SWIPE_THRESHOLD = 48;

const SLIDE_EASE = [0.32, 0.72, 0, 1] as const;
const SLIDE_DURATION = 2.5;

const SPRING_SNAPPY = { type: "spring" as const, stiffness: 380, damping: 32 };
const SPRING_SMOOTH = { type: "spring" as const, stiffness: 260, damping: 28 };
const SPRING_MAGNET = { stiffness: 300, damping: 18, mass: 0.4 };
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;
const SLIDE_TRANSITION: Transition = { duration: SLIDE_DURATION, ease: SLIDE_EASE };
const HERO_THEME_TRANSITION: Transition = { duration: SLIDE_DURATION, ease: SLIDE_EASE };
const DRAG_SNAP: Transition = { type: "spring", stiffness: 180, damping: 32, mass: 0.95 };
const INSTANT_TRANSITION: Transition = { duration: 0 };
const HERO_BG_CSS_TRANSITION = `background-color ${SLIDE_DURATION}s cubic-bezier(0.32, 0.72, 0, 1), background-image ${SLIDE_DURATION}s cubic-bezier(0.32, 0.72, 0, 1)`;

const contentStagger: Variants = {
  hidden: { opacity: 0 },
  idle: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

const contentUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  idle: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT_EXPO } },
};

const productEnter: Variants = {
  hidden: { opacity: 0, x: 10, scale: 0.98 },
  idle: { opacity: 1, x: 0, scale: 1 },
  show: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

const trustStagger: Variants = {
  hidden: { opacity: 0 },
  idle: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const trustUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  idle: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: SPRING_SMOOTH },
};

/** Counts up to the target price whenever the slide becomes active. */
function AnimatedPrice({ value, isActive }: { value: number; isActive: boolean }) {
  const count = useMotionValue(value);
  const formatted = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (!isActive) {
      count.set(value);
      return;
    }
    count.set(0);
    const controls = animate(count, value, { duration: 0.9, ease: EASE_OUT_EXPO });
    return () => controls.stop();
  }, [value, isActive, count]);

  return <motion.span>{formatted}</motion.span>;
}

/** Button that leans toward the cursor while hovered. */
function MagneticButton({
  children,
  onClick,
  className,
  style,
  strength = 0.3,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  strength?: number;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, SPRING_MAGNET);
  const y = useSpring(my, SPRING_MAGNET);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={className}
      style={{ ...style, x, y }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left - r.width / 2) * strength);
        my.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={SPRING_SNAPPY}
    >
      {children}
    </motion.button>
  );
}

function HeroAtmosphere({
  accent,
  parallaxX,
  parallaxY,
  spotlight,
  paused = false,
}: {
  accent: HeroAccent;
  parallaxX: MotionValue<number>;
  parallaxY: MotionValue<number>;
  spotlight: MotionValue<string>;
  paused?: boolean;
}) {
  const orbs = getHeroMeshOrbs(accent);
  const orbX = useTransform(parallaxX, [-1, 1], [-18, 18]);
  const orbY = useTransform(parallaxY, [-1, 1], [-12, 12]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${paused ? "hero-bg-paused" : ""}`}
      aria-hidden
    >
      {orbs.map((orb, i) => (
        <MeshOrb key={`orb-${i}`} orb={orb} orbX={orbX} orbY={orbY} />
      ))}

      {/* Aurora sweep — CSS spin keeps this on the compositor thread */}
      <div
        className="hero-bg-animate absolute left-1/2 top-1/2 aspect-square w-[130%] opacity-45 blur-xl will-change-transform"
        style={{
          background: getHeroAuroraGradient(accent),
          transform: "translate(-50%, -50%)",
          animation: "hero-aurora-spin 48s linear infinite",
          transition: HERO_BG_CSS_TRANSITION,
        }}
      />

      {/* Cursor spotlight */}
      <motion.div className="absolute inset-0 hidden md:block" style={{ background: spotlight }} />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `linear-gradient(${accent.color}0a 1px, transparent 1px), linear-gradient(90deg, ${accent.color}0a 1px, transparent 1px)`,
          backgroundSize: "52px 52px",
          maskImage: "radial-gradient(ellipse 85% 75% at 50% 45%, black 15%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 45%, black 15%, transparent 78%)",
        }}
      />

      {/* Glass shimmer sweep */}
      <div
        className="hero-bg-animate absolute inset-0 opacity-[0.16] will-change-transform"
        style={{
          background:
            "linear-gradient(105deg, transparent 42%, rgba(255,255,255,0.55) 50%, transparent 58%)",
          animation: "hero-shimmer-sweep 9s ease-in-out infinite",
        }}
      />

      {/* Edge vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, ${accent.color}0f 100%)`,
        }}
      />
    </div>
  );
}

function MeshOrb({
  orb,
  orbX,
  orbY,
}: {
  orb: ReturnType<typeof getHeroMeshOrbs>[number];
  orbX: MotionValue<number>;
  orbY: MotionValue<number>;
}) {
  const x = useTransform(orbX, (v) => v * orb.depth);
  const y = useTransform(orbY, (v) => v * orb.depth);

  return (
    <motion.div
      className="absolute will-change-transform"
      style={{ left: orb.x, top: orb.y, x, y }}
    >
      <div
        className="hero-bg-animate rounded-full blur-2xl will-change-transform"
        style={{
          width: orb.size,
          height: orb.size,
          background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          animation: `hero-orb-breathe ${orb.duration}s ease-in-out infinite`,
          transition: HERO_BG_CSS_TRANSITION,
        }}
      />
    </motion.div>
  );
}

function HeroTrustBadges({ isActive, accent }: { isActive: boolean; accent: HeroAccent }) {
  return (
    <motion.div
      className="absolute bottom-2 right-2 z-30 hidden flex-col gap-1.5 md:bottom-4 md:right-4 md:flex"
      initial={isActive ? "hidden" : false}
      animate={isActive ? "show" : "idle"}
      variants={trustStagger}
    >
      {HERO_TRUST_BADGES.map((b) => (
        <motion.div
          key={b.title}
          className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/70 px-2.5 py-1.5 backdrop-blur-xl sm:px-3 sm:py-2"
          style={{
            boxShadow: `0 6px 24px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.9)`,
          }}
          variants={trustUp}
          whileHover={{ scale: 1.04, y: -2, boxShadow: `0 10px 30px ${accent.glow}` }}
          transition={SPRING_SNAPPY}
        >
          <span className="text-sm">{b.icon}</span>
          <div>
            <div className="font-label text-[9px] font-bold text-gray-900 sm:text-[10px]">{b.title}</div>
            <div className="font-label text-[7px] text-gray-500 sm:text-[8px]">{b.sub}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function HeroSlideTimer({
  displayIndex,
  slideCount,
  progress,
  accent,
  onSeek,
}: {
  displayIndex: number;
  slideCount: number;
  progress: MotionValue<number>;
  accent: HeroAccent;
  onSeek: (index: number) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
      <div className="hidden sm:block">
        <AnimatePresence mode="wait">
          <motion.span
            key={displayIndex}
            className="block font-mono text-[10px] font-medium tracking-widest text-slate-400"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {String(displayIndex + 1).padStart(2, "0")} / {String(slideCount).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: slideCount }, (_, i) => {
          const active = i === displayIndex;
          return (
            <motion.button
              key={`prog-${i}`}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => onSeek(i)}
              className="group relative h-[3px] cursor-pointer overflow-hidden rounded-full bg-slate-200/90"
              animate={{ width: active ? 48 : 12 }}
              transition={SPRING_SNAPPY}
              whileHover={{ scaleY: 1.8 }}
              whileTap={{ scale: 0.95 }}
            >
              {active ? (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${accent.color}, ${accent.neon})`,
                    scaleX: progress,
                    originX: 0,
                  }}
                />
              ) : (
                <div
                  className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{ background: `${accent.color}50` }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function SlideTitle({ text, animateIn }: { text: string; animateIn: boolean }) {
  const lines = formatHeroTitle(text, 18).split("\n").slice(0, 2);

  return (
    <div>
      {lines.map((line, i) => (
        <div key={i} className="overflow-hidden leading-[1.12]">
          <motion.span
            className="block text-gray-950"
            initial={animateIn ? { y: "110%", opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.6,
              ease: EASE_OUT_EXPO,
              delay: animateIn ? 0.08 + i * 0.09 : 0,
            }}
          >
            {line}
          </motion.span>
        </div>
      ))}
    </div>
  );
}

function HeroSlidePanel({
  slide,
  index,
  isActive,
  onPrimaryAction,
  onViewAll,
}: {
  slide: HeroSlide;
  index: number;
  isActive: boolean;
  onPrimaryAction: (slide: HeroSlide) => void;
  onViewAll?: () => void;
}) {
  const ac = getSlideAccent(index, slide.slideKind);
  const badge = getEyebrowBadgeStyle(slide.eyebrow, ac);
  const animateIn = isActive;

  return (
    <div
      className={`${HERO_SLIDE_MIN_H} relative flex h-full w-full min-w-0 shrink-0 basis-full flex-col overflow-hidden sm:block`}
    >
      <div className="relative z-10 min-w-0 shrink-0 px-3 pb-1 pt-3 sm:absolute sm:inset-0 sm:flex sm:max-w-[52%] sm:items-center sm:px-5 sm:py-6 md:px-8 md:py-8 lg:max-w-[48%] lg:px-10">
        <motion.div
          className="w-full min-w-0 max-w-[380px]"
          variants={contentStagger}
          initial={isActive ? "hidden" : false}
          animate={isActive ? "show" : "idle"}
        >
          <motion.div className="mb-2 flex items-center gap-1.5" variants={contentUp}>
            <span className="relative flex h-1.5 w-1.5 shrink-0 sm:h-2 sm:w-2">
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full"
                style={{ background: badge.dot }}
                animate={{ scale: [1, 1.9, 1], opacity: [0.9, 0, 0.9] }}
                transition={{ duration: 1.9, repeat: Infinity, ease: "easeOut" }}
              />
              <span className="relative inline-flex h-full w-full rounded-full" style={{ background: badge.dot }} />
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 ${type.eyebrow} text-[8px] tracking-[0.12em] backdrop-blur-sm sm:text-[9px]`}
              style={{ background: badge.bg, color: badge.color, borderColor: badge.border }}
            >
              {slide.eyebrow}
            </span>
          </motion.div>

          <motion.div variants={contentUp}>
            <h2 className="mb-1.5 line-clamp-2 max-w-[240px] font-display text-[14px] font-bold leading-[1.25] text-gray-950 sm:max-w-[260px] sm:text-[15px] md:text-[16px]">
              <SlideTitle text={slide.title} animateIn={animateIn} />
            </h2>
          </motion.div>

          <motion.div
            className="mb-2 h-[3px] w-10 rounded-full md:mb-2.5"
            style={{ background: `linear-gradient(90deg, ${ac.color}, ${ac.neon}, transparent)` }}
            variants={contentUp}
          />

          {slide.price != null && slide.price > 0 ? (
            <motion.div
              className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 md:mb-2.5"
              variants={contentUp}
            >
              <span
                className="font-display text-[15px] font-extrabold tabular-nums sm:text-[16px] md:text-[18px]"
                style={{ color: ac.dark }}
              >
                QAR <AnimatedPrice value={slide.price} isActive={isActive} />
              </span>
              {slide.compareAtPrice != null && slide.compareAtPrice > slide.price ? (
                <span className="font-label text-[10px] text-slate-400 line-through sm:text-[11px]">
                  QAR {slide.compareAtPrice.toLocaleString()}
                </span>
              ) : null}
              {slide.discount != null && slide.discount > 0 ? (
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 font-label text-[9px] font-bold text-red-600 ring-1 ring-red-500/25">
                  -{slide.discount}%
                </span>
              ) : null}
            </motion.div>
          ) : null}

          <motion.p
            className="mb-3 line-clamp-2 max-w-[300px] text-[11px] leading-relaxed text-slate-600 sm:text-[12px] md:mb-3"
            variants={contentUp}
          >
            {slide.sub}
          </motion.p>

          <motion.div className="flex flex-wrap items-center gap-2" variants={contentUp}>
            <MagneticButton
              onClick={() => onPrimaryAction(slide)}
              className="group/cta relative flex cursor-pointer items-center gap-1.5 overflow-hidden rounded-full px-5 py-2.5 font-label text-[11px] font-bold text-white sm:px-6 sm:text-[12px]"
              style={{
                background: `linear-gradient(135deg, ${ac.color} 0%, ${ac.neon} 100%)`,
                boxShadow: `0 6px 24px ${ac.glow}, inset 0 1px 0 rgba(255,255,255,0.28)`,
              }}
            >
              <motion.span
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "linear-gradient(100deg,transparent,rgba(255,255,255,0.42),transparent)",
                }}
                animate={{ x: ["-110%", "210%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.8, ease: "easeInOut" }}
              />
              <span className="relative z-[1]">{slide.cta}</span>
              <motion.svg
                className="relative z-[1] h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </motion.svg>
            </MagneticButton>

            <MagneticButton
              onClick={onViewAll}
              strength={0.18}
                className="hidden cursor-pointer rounded-full border border-gray-200/80 bg-transparent px-4 py-2.5 font-label text-[11px] font-semibold text-gray-700 md:inline-flex md:text-[12px]"
            >
              View all deals
            </MagneticButton>
          </motion.div>

          {slide.note ? (
            <motion.p className="mt-2 hidden font-label text-[8px] text-slate-400 sm:block sm:text-[9px]" variants={contentUp}>
              {slide.note}
            </motion.p>
          ) : null}
        </motion.div>
      </div>

      <motion.div
        className="pointer-events-none relative z-[2] mt-auto flex min-h-[160px] shrink-0 items-center justify-center px-4 pb-3 pt-0 sm:absolute sm:inset-0 sm:mt-0 sm:min-h-0 sm:justify-center sm:px-6 sm:pb-0 sm:pt-0 sm:pl-[38%] sm:pr-[6%] md:pl-[36%] md:pr-[8%] lg:pl-[34%] lg:pr-[10%]"
        variants={productEnter}
        initial={isActive ? "hidden" : false}
        animate={isActive ? "show" : "idle"}
      >
        <div className={`${HERO_IMAGE_INNER} flex h-[140px] w-full max-w-[220px] items-center justify-center sm:h-[72%] sm:max-w-[260px] md:max-w-[300px] lg:max-w-[340px] xl:max-w-[360px]`}>
          <StoreImage
            src={slide.img}
            alt={formatHeroTitle(slide.title).replace("\n", " ")}
            priority
            blend={false}
            className={getHeroImageClass()}
            style={{ background: "transparent", maxHeight: "100%", width: "auto", height: "100%" }}
          />
        </div>
      </motion.div>

      <HeroTrustBadges isActive={isActive} accent={ac} />
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div
      className={`${HERO_SLIDE_MIN_H} relative flex w-full flex-col overflow-hidden rounded-2xl bg-[#f8fafc] sm:block md:rounded-3xl`}
      style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40 animate-shimmer-bar"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)",
        }}
      />
      <div className="relative z-10 shrink-0 px-4 pb-2 pt-4 sm:absolute sm:inset-0 sm:flex sm:max-w-[48%] sm:flex-col sm:justify-center sm:px-5 md:max-w-[46%] md:px-8">
        <div className="h-3 w-24 rounded-full bg-slate-200/80" />
        <div className="mt-2 h-8 w-full max-w-sm rounded-lg bg-slate-200/80" />
        <div className="mt-2 h-9 w-32 rounded-full bg-slate-200/80" />
      </div>
      <div className="relative z-[2] mt-auto flex min-h-[160px] shrink-0 items-center justify-center px-4 pb-3 sm:absolute sm:inset-0 sm:mt-0 sm:min-h-0 sm:justify-center sm:pb-0 sm:pl-[38%] sm:pr-[6%] md:pl-[36%]">
        <div className="h-[140px] w-full max-w-[220px] animate-pulse rounded-2xl bg-slate-200/60 sm:h-[230px] sm:max-w-[270px] md:h-[280px] md:max-w-[340px]" />
      </div>
    </div>
  );
}

interface HeroSectionProps {
  slides?: HeroSlide[];
  isLoading?: boolean;
  onSlideAction?: (slide: HeroSlide) => void;
  onViewAll?: () => void;
}

export default function HeroSection({
  slides: apiSlides = [],
  isLoading = false,
  onSlideAction,
  onViewAll,
}: HeroSectionProps) {
  const slides = useMemo(() => buildHeroSlides(apiSlides), [apiSlides]);
  const trackSlides = useMemo(() => [...slides, slides[0]], [slides]);

  const [trackIndex, setTrackIndex] = useState(0);
  const [instant, setInstant] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const trackIndexRef = useRef(0);
  const remainingRef = useRef(AUTO_MS);

  useEffect(() => {
    trackIndexRef.current = trackIndex;
  }, [trackIndex]);

  const displayIndex = trackIndex % SLIDE_COUNT;
  const accent = getSlideAccent(displayIndex, slides[displayIndex]?.slideKind);
  const heroSurface = getHeroSurfaceStyle(accent);
  const bgPaused = isDragging || instant;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spotX = useMotionValue(-500);
  const spotY = useMotionValue(-500);
  const progress = useMotionValue(0);
  const parallaxX = useSpring(mx, { stiffness: 200, damping: 26 });
  const parallaxY = useSpring(my, { stiffness: 200, damping: 26 });
  const smoothSpotX = useSpring(spotX, { stiffness: 220, damping: 30 });
  const smoothSpotY = useSpring(spotY, { stiffness: 220, damping: 30 });
  const heroSpotlight = useMotionTemplate`radial-gradient(340px circle at ${smoothSpotX}px ${smoothSpotY}px, ${accent.neon}1f, transparent 72%)`;

  const goTo = useCallback((index: number) => {
    setInstant(false);
    setTrackIndex(index);
  }, []);

  const next = useCallback(() => {
    setInstant(false);
    setTrackIndex((i) => (i >= SLIDE_COUNT ? SLIDE_COUNT : i + 1));
  }, []);

  const prev = useCallback(() => {
    setInstant(false);
    setTrackIndex((i) => (i <= 0 ? SLIDE_COUNT - 1 : i - 1));
  }, []);

  const handleTrackComplete = useCallback(() => {
    if (trackIndexRef.current !== SLIDE_COUNT) return;
    setInstant(true);
    setTrackIndex(0);
    requestAnimationFrame(() => requestAnimationFrame(() => setInstant(false)));
  }, []);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const { offset, velocity } = info;
      if (offset.x < -SWIPE_THRESHOLD || velocity.x < -400) {
        setIsDragging(false);
        next();
        return;
      }
      if (offset.x > SWIPE_THRESHOLD || velocity.x > 400) {
        setIsDragging(false);
        prev();
        return;
      }
      setIsDragging(false);
    },
    [next, prev]
  );

  const autoPlayActive = !isHovering && !isDragging;

  useEffect(() => {
    if (trackIndex !== SLIDE_COUNT) return;
    const id = window.setTimeout(handleTrackComplete, SLIDE_DURATION * 1000 + 40);
    return () => window.clearTimeout(id);
  }, [trackIndex, handleTrackComplete]);

  /** Fresh countdown for each slide; pausing keeps whatever time is left. */
  useEffect(() => {
    progress.set(0);
    remainingRef.current = AUTO_MS;
  }, [trackIndex, progress]);

  useEffect(() => {
    if (!autoPlayActive) return;
    const duration = remainingRef.current;
    const startedAt = Date.now();
    const controls = animate(progress, 1, { duration: duration / 1000, ease: "linear" });
    const timer = window.setTimeout(next, duration);
    return () => {
      controls.stop();
      window.clearTimeout(timer);
      remainingRef.current = Math.max(0, duration - (Date.now() - startedAt));
    };
  }, [trackIndex, autoPlayActive, next, progress]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const handlePrimaryAction = useCallback(
    (slide: HeroSlide) => {
      if (slide.slug && onSlideAction) {
        onSlideAction(slide);
        return;
      }
      onViewAll?.();
    },
    [onSlideAction, onViewAll]
  );

  if (isLoading) {
    return (
      <div className="pb-2 pt-1">
        <HeroSkeleton />
      </div>
    );
  }

  return (
    /**
     * `reducedMotion="user"` is handled inside Motion's animation layer, so the
     * rendered markup stays identical between server and client. Branching on
     * `useReducedMotion()` here instead would hydrate-mismatch, because the hook
     * reads the media query during the first render.
     */
    <MotionConfig reducedMotion="user">
      <motion.div
        className="pb-2 pt-1"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      >
        {/* Animated gradient border */}
        <div className={`relative overflow-hidden rounded-[18px] p-[1.5px] md:rounded-[26px] ${bgPaused ? "hero-bg-paused" : ""}`}>
          <div
            className="hero-bg-animate absolute left-1/2 top-1/2 aspect-square w-[160%] opacity-55 will-change-transform"
            style={{
              background: getHeroBeamGradient(accent),
              transform: "translate(-50%, -50%)",
              animation: "hero-beam-spin 10s linear infinite",
              transition: HERO_BG_CSS_TRANSITION,
            }}
          />

          <motion.div
            className="group relative flex w-full flex-col overflow-hidden rounded-[17px] md:rounded-[25px]"
            animate={{
              boxShadow: `0 18px 50px -12px ${accent.glow}, 0 2px 8px rgba(15,23,42,0.06)`,
            }}
            transition={{ boxShadow: HERO_THEME_TRANSITION }}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              mx.set((e.clientX - r.left - r.width / 2) / (r.width / 2));
              my.set((e.clientY - r.top - r.height / 2) / (r.height / 2));
              spotX.set(e.clientX - r.left);
              spotY.set(e.clientY - r.top);
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
              mx.set(0);
              my.set(0);
              spotX.set(-500);
              spotY.set(-500);
              setIsHovering(false);
            }}
            tabIndex={0}
            role="region"
            aria-label="Featured products carousel"
            aria-roledescription="carousel"
          >
            {/* <AnimatePresence>
              {isHovering ? (
                <motion.div
                  className="pointer-events-none absolute left-1/2 top-3 z-30 hidden items-center gap-1.5 rounded-full border border-white/70 bg-white/75 px-3 py-1 font-label text-[10px] font-semibold text-slate-600 shadow-sm backdrop-blur-xl md:flex"
                  style={{ x: "-50%" }}
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={SPRING_SNAPPY}
                >
                  <motion.span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: accent.color }}
                    animate={{ opacity: [1, 0.25, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  Swipe or drag to browse
                </motion.div>
              ) : null}
            </AnimatePresence> */}

            <div className={`relative min-h-0 flex-1 overflow-hidden ${HERO_SLIDE_MIN_H}`}>
              {/* One shared background — avoids 5× duplicated blur animations while sliding */}
              <div
                className={`pointer-events-none absolute inset-0 z-0 ${bgPaused ? "hero-bg-paused" : ""}`}
                style={{ ...heroSurface, transition: HERO_BG_CSS_TRANSITION }}
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-0 z-[1]">
                <HeroAtmosphere
                  accent={accent}
                  parallaxX={parallaxX}
                  parallaxY={parallaxY}
                  spotlight={heroSpotlight}
                  paused={bgPaused}
                />
              </div>

              <motion.div
                className="relative z-10 flex h-full min-h-[inherit] w-full min-w-0 cursor-grab touch-pan-y active:cursor-grabbing will-change-transform"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                dragMomentum={false}
                dragTransition={DRAG_SNAP}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                animate={{ x: `-${trackIndex * 100}%` }}
                transition={instant ? INSTANT_TRANSITION : SLIDE_TRANSITION}
                onAnimationComplete={handleTrackComplete}
              >
                {trackSlides.map((s, i) => (
                  <div key={`track-${i}`} className="flex h-full min-h-[inherit] w-full min-w-0 shrink-0 basis-full">
                    <HeroSlidePanel
                      slide={s}
                      index={i < SLIDE_COUNT ? i : 0}
                      isActive={trackIndex === i}
                      onPrimaryAction={handlePrimaryAction}
                      onViewAll={onViewAll}
                    />
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="relative z-20 flex shrink-0 items-center justify-between gap-2 border-t border-white/60 bg-white/40 px-2.5 py-2 backdrop-blur-xl sm:gap-3 sm:px-5 sm:py-2.5 md:px-7">
              <div className={`flex min-w-0 items-center gap-1.5 overflow-x-auto sm:gap-2 ${tw.scrollbarHide}`}>
                {slides.map((sl, i) => {
                  const ta = getSlideAccent(i, sl.slideKind);
                  const active = i === displayIndex;
                  const label = HERO_SLIDE_LABELS[i] ?? `Slide ${i + 1}`;
                  return (
                    <motion.button
                      key={`thumb-${i}`}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`${label}: ${formatHeroTitle(sl.title).replace("\n", " ")}`}
                      aria-current={active ? "true" : undefined}
                      className="group relative flex shrink-0 cursor-pointer flex-col items-center gap-1"
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.94 }}
                      transition={SPRING_SNAPPY}
                    >
                      <motion.div
                        className="relative overflow-hidden rounded-[10px] border-2 bg-transparent"
                        animate={{
                          width: active ? 44 : 28,
                          height: 28,
                          borderColor: active ? ta.color : "rgba(15,23,42,0.08)",
                          boxShadow: active ? `0 6px 18px ${ta.glow}` : "0 0 0 rgba(0,0,0,0)",
                        }}
                        transition={SPRING_SNAPPY}
                      >
                        <StoreImage
                          src={sl.img}
                          alt=""
                          blend={false}
                          className="h-full w-full object-contain p-0.5"
                        />
                        {active ? (
                          <motion.div
                            className="absolute inset-x-0 bottom-0 h-[3px]"
                            layoutId="thumb-active-bar"
                            style={{ background: `linear-gradient(90deg, ${ta.color}, ${ta.neon})` }}
                            transition={SPRING_SNAPPY}
                          />
                        ) : null}
                      </motion.div>
                      <motion.span
                        className="hidden font-label text-[8px] font-semibold uppercase tracking-wider sm:block"
                        animate={{ color: active ? ta.dark : "#94a3b8", opacity: active ? 1 : 0.65 }}
                        transition={{ duration: 0.2 }}
                      >
                        {label}
                      </motion.span>
                    </motion.button>
                  );
                })}
              </div>

              <HeroSlideTimer
                displayIndex={displayIndex}
                slideCount={SLIDE_COUNT}
                progress={progress}
                accent={accent}
                onSeek={goTo}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </MotionConfig>
  );
}
