"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import StoreImage from "./StoreImage";
import { HERO_SLIDER_SLIDES } from "@/lib/data";
import { type, tw } from "@/lib/theme";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

const SLIDES = HERO_SLIDER_SLIDES;
const AUTO_MS = 5500;

const ACCENTS = [
  { color: "#111827", soft: "#E5E7EB", dark: "#030712", glow: "rgba(17,24,39,0.18)" },
  { color: "#0891b2", soft: "#cffafe", dark: "#164e63", glow: "rgba(8,145,178,0.16)" },
  { color: "#1F2937", soft: "#F3F4F6", dark: "#111827", glow: "rgba(17,24,39,0.18)" },
  { color: "#7c3aed", soft: "#ede9fe", dark: "#4c1d95", glow: "rgba(124,58,237,0.14)" },
];

/* ── Animated title lines ── */
function SlideTitle({ text }: { text: string }) {
  return (
    <div>
      {text.split("\n").map((line, i) => (
        <div key={i} className="overflow-hidden leading-[1.08]">
          <motion.span
            className="block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.06 + i * 0.1 }}
          >
            {line}
          </motion.span>
        </div>
      ))}
    </div>
  );
}

export default function HeroSection({ onViewAll }: { onViewAll?: () => void }) {
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [prog, setProg] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const ix = useTransform(mx, [-400, 400], [-8, 8]);
  const iy = useTransform(my, [-200, 200], [-4, 4]);

  const go = useCallback((n: number) => {
    setDirection(n > slide || (slide === SLIDES.length - 1 && n === 0) ? 1 : -1);
    setSlide(n);
    setProg(0);
  }, [slide]);

  useEffect(() => {
    setProg(0);
    const step = 100 / (AUTO_MS / 60);
    timerRef.current = setInterval(() => {
      setProg(p => {
        if (p >= 100) {
          setDirection(1);
          setSlide(s => (s + 1) % SLIDES.length);
          return 0;
        }
        return p + step;
      });
    }, 60);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slide]);

  const s = SLIDES[slide];
  const ac = ACCENTS[slide % ACCENTS.length];

  /* Slide animation variants — smooth crossfade + subtle directional movement */
  const imageVariants = {
    enter: (d: number) => ({ opacity: 0, scale: 1.06, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, scale: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, scale: 0.97, x: d > 0 ? -30 : 30 }),
  };

  const contentVariants = {
    enter: { opacity: 0, y: 18 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  };

  return (
    <div className="pb-2 pt-1">
      <div
        className={`${tw.heroSlider} relative w-full overflow-hidden rounded-2xl md:rounded-3xl`}
        style={{
          background: "#ffffff",
          boxShadow: "0 2px 24px rgba(0,0,0,0.07), 0 0 0 1.5px rgba(0,0,0,0.05)",
        }}
        onMouseMove={e => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(e.clientX - r.left - r.width / 2);
          my.set(e.clientY - r.top - r.height / 2);
        }}
        onMouseLeave={() => { mx.set(0); my.set(0); }}
      >
        {/* ── Dot grid background ── */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: "#fafbfc",
            backgroundImage: `radial-gradient(circle, ${ac.color}18 1.2px, transparent 1.2px)`,
            backgroundSize: "26px 26px",
            transition: "background-image 0.5s ease",
          }}
        />

        {/* ── Accent glow blob ── */}
        <motion.div
          className="pointer-events-none absolute z-[1]"
          style={{
            right: "-5%", top: "10%",
            width: "55%", height: "80%",
          }}
          animate={{
            background: `radial-gradient(ellipse at center, ${ac.glow} 0%, transparent 68%)`,
          }}
          transition={{ duration: 0.8 }}
        />

        {/* ═══════════════════════════════════════════════
            LAYOUT: stacked on mobile, side-by-side on md+
        ═══════════════════════════════════════════════ */}
        <div className="relative z-[5] flex flex-col md:flex-row md:items-stretch"
          style={{ minHeight: "clamp(260px, 42vw, 480px)" }}
        >
          {/* ── LEFT: Content ── */}
          <div className="relative z-10 flex flex-1 items-center px-5 pt-6 pb-2 sm:px-7 sm:pt-8 md:w-[56%] md:flex-none md:px-10 md:py-8 lg:px-14 lg:py-10">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`c-${slide}`}
                className="w-full max-w-[460px]"
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={direction}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {/* Eyebrow */}
                <motion.div
                  className="mb-3 flex items-center gap-2 md:mb-4"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: ac.color }} />
                    <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: ac.color }} />
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 ${type.eyebrow} text-[9px] tracking-[0.14em] sm:px-3 sm:py-1 sm:text-[10px]`}
                    style={{ background: ac.soft, color: ac.dark, borderColor: `${ac.color}25` }}
                  >
                    {s.eyebrow}
                  </span>
                </motion.div>

                {/* Title */}
                <h2
                  className="mb-3 font-display font-extrabold tracking-tight text-gray-950 md:mb-4"
                  style={{ fontSize: "clamp(20px, 3.5vw, 44px)" }}
                >
                  <SlideTitle text={s.title} />
                </h2>

                {/* Divider */}
                <motion.div
                  className="mb-3 h-[3px] w-8 rounded-full md:mb-4 md:w-10"
                  style={{ background: `linear-gradient(90deg, ${ac.color}, ${ac.soft})` }}
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                />

                {/* Subtitle */}
                <motion.p
                  className="mb-4 max-w-[280px] text-[12px] leading-relaxed text-slate-500 sm:text-[13px] md:mb-6 md:max-w-[300px] md:text-[14px]"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  {s.sub}
                </motion.p>

                {/* CTAs */}
                <motion.div
                  className="flex flex-wrap items-center gap-2 sm:gap-3"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.38 }}
                >
                  <motion.button
                    type="button"
                    onClick={onViewAll}
                    className="relative flex items-center gap-1.5 overflow-hidden rounded-full px-5 py-2.5 font-label text-[12px] font-bold text-white sm:gap-2 sm:px-7 sm:py-3 sm:text-[13px] md:text-[14px]"
                    style={{
                      background: `linear-gradient(135deg, ${ac.color}, ${ac.color}bb)`,
                      boxShadow: `0 6px 22px ${ac.glow}`,
                    }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <motion.span
                      className="pointer-events-none absolute inset-0"
                      style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)" }}
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.8 }}
                    />
                    {s.cta}
                    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={onViewAll}
                    className="hidden rounded-full px-4 py-2.5 font-label text-[12px] font-medium transition-all sm:inline-flex sm:px-5 sm:py-3 sm:text-[13px]"
                    style={{ border: `1.5px solid ${ac.color}28`, color: ac.dark, background: "white" }}
                    whileHover={{ borderColor: ac.color, background: ac.soft }}
                    whileTap={{ scale: 0.97 }}
                  >
                    View all deals
                  </motion.button>
                </motion.div>

                <motion.p
                  className="mt-2 font-label text-[9px] text-slate-400 sm:mt-3 sm:text-[10px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {s.note}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── RIGHT: Image ── */}
          <div className="relative flex-1 md:w-[44%] md:flex-none">
            {/* Fade divider — only on desktop */}
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-20 md:block"
              style={{ background: "linear-gradient(90deg, #fafbfc 0%, transparent 100%)" }}
            />
            {/* Fade divider — top on mobile (stacked layout) */}
            <div
              className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-8 md:hidden"
              style={{ background: "linear-gradient(180deg, #fafbfc 0%, transparent 100%)" }}
            />

            <div className="relative h-[180px] w-full overflow-hidden sm:h-[220px] md:h-full">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={`img-${slide}`}
                  className="absolute inset-0"
                  variants={imageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={direction}
                  transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
                >
                  <motion.div className="h-full w-full" style={{ x: ix, y: iy }}>
                    <StoreImage
                      src={s.img}
                      alt={s.title}
                      className="h-full w-full object-cover object-center"
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Top-right accent tag — desktop only */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`tag-${slide}`}
                  className="absolute right-3 top-3 z-20 hidden md:block md:right-4 md:top-4"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div
                    className="rounded-xl px-3 py-1.5 text-center shadow-md backdrop-blur-md"
                    style={{ background: "rgba(255,255,255,0.88)", border: `1px solid ${ac.color}20` }}
                  >
                    <div className="font-label text-[9px] font-bold uppercase tracking-widest" style={{ color: ac.color }}>
                      {s.eyebrow}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            BOTTOM BAR — thumbnails + progress
        ═══════════════════════════════════════════════ */}
        <div className="relative z-20 flex items-center justify-between border-t border-gray-100/60 px-4 py-2.5 sm:px-5 sm:py-3 md:px-8 md:py-3.5">
          {/* Thumbnail dots / strip */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {SLIDES.map((sl, i) => (
              <motion.button
                key={i}
                onClick={() => go(i)}
                aria-label={`Slide ${i + 1}`}
                className="relative shrink-0 overflow-hidden rounded-md sm:rounded-lg"
                style={{
                  width: i === slide ? 44 : 30,
                  height: 30,
                  border: `2px solid ${i === slide ? ac.color : "rgba(0,0,0,0.08)"}`,
                  background: "#f1f5f9",
                  transition: "width 0.35s ease, border-color 0.35s ease",
                  boxShadow: i === slide ? `0 2px 10px ${ac.glow}` : "none",
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
              >
                <StoreImage src={sl.img} alt="" className="h-full w-full object-cover" />
                {i === slide && (
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: `${ac.color}18` }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Progress + counter */}
          <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
            <span className="font-mono text-[9px] tracking-widest text-slate-400 sm:text-[10px]">
              {String(slide + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
            </span>
            <div className="h-[3px] w-[52px] overflow-hidden rounded-full bg-gray-200 sm:w-[72px]">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${prog}%`,
                  background: `linear-gradient(90deg, ${ac.color}, ${ac.soft})`,
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Trust badges — desktop only ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`b-${slide}`}
            className="absolute bottom-20 right-4 z-20 hidden flex-col gap-2 lg:flex lg:right-5"
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.45 }}
          >
            {[
              { icon: "⚡", t: "Express Delivery", s: "Fast & Reliable" },
              { icon: "🛡️", t: "Official Warranty", s: "Brand Warranty Products" },
            ].map((b, i) => (
              <motion.div
                key={b.t}
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{
                  background: "rgba(255,255,255,0.90)",
                  border: `1px solid ${ac.color}18`,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  backdropFilter: "blur(12px)",
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.52 + i * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <span className="text-sm">{b.icon}</span>
                <div>
                  <div className="font-label text-[10px] font-bold text-gray-800">{b.t}</div>
                  <div className="font-label text-[9px] text-gray-400">{b.s}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── Prev / Next arrows ── */}
        {[
          { d: -1, lbl: "Prev", side: "left-2 sm:left-3" },
          { d: 1, lbl: "Next", side: "right-2 sm:right-3" },
        ].map(({ d, lbl, side }) => (
          <motion.button
            key={lbl}
            onClick={() => go((slide + d + SLIDES.length) % SLIDES.length)}
            className={`absolute ${side} top-[40%] z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full sm:h-9 sm:w-9 md:top-[45%]`}
            style={{
              background: "rgba(255,255,255,0.90)",
              border: "1.5px solid rgba(0,0,0,0.08)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            whileHover={{ opacity: 1, scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            aria-label={lbl}
          >
            <svg className="h-3.5 w-3.5 text-gray-700 sm:h-4 sm:w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={d === -1 ? "M15.75 19.5L8.25 12l7.5-7.5" : "M8.25 4.5l7.5 7.5-7.5 7.5"} />
            </svg>
          </motion.button>
        ))}
      </div>
    </div>
  );
}