"use client";

import { Hash, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportSummaryItem } from "@/types/reports.types";

type Tone = "green" | "red" | "blue" | "amber" | "violet" | "cyan" | "indigo" | "rose";

const TONES: Record<
  Tone,
  { card: string; icon: string; iconColor: string; label: string }
> = {
  green: {
    card: "border-emerald-100 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/10",
    icon: "bg-emerald-100 dark:bg-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    label: "text-emerald-700/80 dark:text-emerald-400/90",
  },
  red: {
    card: "border-red-100 bg-red-50/40 dark:border-red-500/20 dark:bg-red-500/10",
    icon: "bg-red-100 dark:bg-red-500/20",
    iconColor: "text-red-600 dark:text-red-400",
    label: "text-red-700/80 dark:text-red-400/90",
  },
  blue: {
    card: "border-blue-100 bg-blue-50/40 dark:border-blue-500/20 dark:bg-blue-500/10",
    icon: "bg-blue-100 dark:bg-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    label: "text-blue-700/80 dark:text-blue-400/90",
  },
  amber: {
    card: "border-amber-100 bg-amber-50/40 dark:border-amber-500/20 dark:bg-amber-500/10",
    icon: "bg-amber-100 dark:bg-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    label: "text-amber-700/80 dark:text-amber-400/90",
  },
  violet: {
    card: "border-violet-100 bg-violet-50/40 dark:border-violet-500/20 dark:bg-violet-500/10",
    icon: "bg-violet-100 dark:bg-violet-500/20",
    iconColor: "text-violet-600 dark:text-violet-400",
    label: "text-violet-700/80 dark:text-violet-400/90",
  },
  cyan: {
    card: "border-cyan-100 bg-cyan-50/40 dark:border-cyan-500/20 dark:bg-cyan-500/10",
    icon: "bg-cyan-100 dark:bg-cyan-500/20",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    label: "text-cyan-700/80 dark:text-cyan-400/90",
  },
  indigo: {
    card: "border-indigo-100 bg-indigo-50/40 dark:border-indigo-500/20 dark:bg-indigo-500/10",
    icon: "bg-indigo-100 dark:bg-indigo-500/20",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    label: "text-indigo-700/80 dark:text-indigo-400/90",
  },
  rose: {
    card: "border-rose-100 bg-rose-50/40 dark:border-rose-500/20 dark:bg-rose-500/10",
    icon: "bg-rose-100 dark:bg-rose-500/20",
    iconColor: "text-rose-600 dark:text-rose-400",
    label: "text-rose-700/80 dark:text-rose-400/90",
  },
};

const TONE_CYCLE: Tone[] = ["blue", "green", "violet", "amber", "cyan", "rose", "indigo", "red"];

function isHighlight(label: string, index: number, total: number) {
  return /total|revenue|sales|grand/i.test(label) && index === total - 1;
}

interface ReportSummaryCardProps {
  items: ReportSummaryItem[];
  loading?: boolean;
}

function ReportSummaryCard({ items, loading }: ReportSummaryCardProps) {
  if (!items.length) return null;

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
        loading && "pointer-events-none opacity-60"
      )}
    >
      {items.map((item, index) => {
        const highlight = isHighlight(item.label, index, items.length);
        const tone = highlight ? "indigo" : TONE_CYCLE[index % TONE_CYCLE.length];
        const t = TONES[tone];
        const Icon: LucideIcon = Hash;

        return (
          <div
            key={item.label}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-2.5 py-2 shadow-sm transition-shadow hover:shadow-md",
              highlight
                ? "border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 dark:border-indigo-500/30 dark:from-indigo-500/15 dark:to-violet-500/10"
                : t.card
            )}
          >
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                highlight ? "bg-indigo-100 dark:bg-indigo-500/20" : t.icon
              )}
            >
              <Icon
                className={cn("h-3.5 w-3.5", highlight ? "text-indigo-600 dark:text-indigo-400" : t.iconColor)}
                strokeWidth={2.2}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-xs font-medium leading-tight",
                  highlight ? "text-indigo-600/80 dark:text-indigo-400/90" : t.label
                )}
              >
                {item.label}
              </p>
              <p
                className={cn(
                  "truncate font-bold leading-tight text-foreground",
                  highlight ? "text-lg text-indigo-900 dark:text-indigo-200" : "text-sm"
                )}
              >
                {item.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ReportSummaryCard;
