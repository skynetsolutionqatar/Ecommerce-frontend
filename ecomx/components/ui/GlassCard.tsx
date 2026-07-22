"use client";

import type { ReactNode, MouseEventHandler } from "react";

type GlassVariant = "light" | "dark" | "frosted";

const VARIANT: Record<GlassVariant, string> = {
  light:
    "border-white/80 bg-white/50 shadow-[0_8px_32px_rgba(17,24,39,0.07),inset_0_1px_0_rgba(255,255,255,0.85)]",
  dark:
    "border-white/12 bg-white/[0.07] shadow-[0_12px_40px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)]",
  frosted:
    "border-white/60 bg-white/35 shadow-[0_10px_36px_rgba(17,24,39,0.08),inset_0_1px_0_rgba(255,255,255,0.75)]",
};

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: GlassVariant;
  hover?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  as?: "div" | "button" | "article";
}

export function GlassCard({
  children,
  className = "",
  variant = "light",
  hover = true,
  onClick,
  as: Tag = onClick ? "button" : "div",
}: GlassCardProps) {
  return (
    <Tag
      type={Tag === "button" ? "button" : undefined}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${VARIANT[variant]} ${
        hover
          ? "hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(17,24,39,0.12)] hover:border-accent/25"
          : ""
      } ${onClick ? "cursor-pointer text-left" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

/** Inner glass inset panel — image wells, stat chips */
export function GlassPanel({ children, className = "" }: GlassPanelProps) {
  return (
    <div
      className={`rounded-xl border border-white/25 bg-white/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_4px_20px_rgba(17,24,39,0.04)] backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}
