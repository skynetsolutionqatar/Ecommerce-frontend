"use client";

import { memo } from "react";
import {
  Hash,
  IndianRupee,
  ShoppingCart,
  Tags,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportSummaryItem } from "@/types/reports.types";

type Tone = "blue" | "green" | "violet" | "amber" | "cyan" | "indigo";

const TONES: Record<Tone, { card: string; icon: string; iconColor: string; label: string }> = {
  blue: {
    card: "border-blue-100 bg-blue-50/40 dark:border-blue-900/40 dark:bg-blue-950/30",
    icon: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    label: "text-blue-700/80 dark:text-blue-300/80",
  },
  green: {
    card: "border-emerald-100 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/30",
    icon: "bg-emerald-100 dark:bg-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    label: "text-emerald-700/80 dark:text-emerald-300/80",
  },
  violet: {
    card: "border-violet-100 bg-violet-50/40 dark:border-violet-900/40 dark:bg-violet-950/30",
    icon: "bg-violet-100 dark:bg-violet-900/50",
    iconColor: "text-violet-600 dark:text-violet-400",
    label: "text-violet-700/80 dark:text-violet-300/80",
  },
  amber: {
    card: "border-amber-100 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/30",
    icon: "bg-amber-100 dark:bg-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
    label: "text-amber-700/80 dark:text-amber-300/80",
  },
  cyan: {
    card: "border-cyan-100 bg-cyan-50/40 dark:border-cyan-900/40 dark:bg-cyan-950/30",
    icon: "bg-cyan-100 dark:bg-cyan-900/50",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    label: "text-cyan-700/80 dark:text-cyan-300/80",
  },
  indigo: {
    card: "border-indigo-100 bg-indigo-50/40 dark:border-indigo-900/40 dark:bg-indigo-950/30",
    icon: "bg-indigo-100 dark:bg-indigo-900/50",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    label: "text-indigo-700/80 dark:text-indigo-300/80",
  },
};

const TONE_CYCLE: Tone[] = ["blue", "green", "violet", "amber", "cyan", "indigo"];

const LABEL_META: { match: RegExp; icon: LucideIcon; tone: Tone }[] = [
  { match: /revenue|sales|amount|total/i, icon: IndianRupee, tone: "indigo" },
  { match: /order/i, icon: ShoppingCart, tone: "blue" },
  { match: /customer/i, icon: Users, tone: "green" },
  { match: /categor/i, icon: Tags, tone: "violet" },
  { match: /period|source|campaign/i, icon: TrendingUp, tone: "cyan" },
];

function resolveMeta(item: ReportSummaryItem, index: number) {
  const found = LABEL_META.find((m) => m.match.test(item.label));
  const tone = found?.tone ?? TONE_CYCLE[index % TONE_CYCLE.length];
  const Icon = found?.icon ?? Hash;
  return { Icon, tone };
}

interface ReportSummaryProps {
  items: ReportSummaryItem[];
  loading?: boolean;
}

function ReportSummary({ items, loading }: ReportSummaryProps) {
  if (!items.length) return null;

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
        loading && "pointer-events-none opacity-60"
      )}
    >
      {items.map((item, index) => {
        const { Icon, tone } = resolveMeta(item, index);
        const t = TONES[tone];
        const highlight = /total revenue|total sales|grand|category revenue/i.test(item.label);

        return (
          <div
            key={item.label}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-2.5 py-2 shadow-sm transition-shadow hover:shadow-md",
              highlight
                ? "border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-violet-950/40"
                : t.card
            )}
          >
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                highlight ? "bg-indigo-100 dark:bg-indigo-900/50" : t.icon
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5",
                  highlight ? "text-indigo-600 dark:text-indigo-400" : t.iconColor
                )}
                strokeWidth={2.2}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-xs font-medium leading-tight",
                  highlight ? "text-indigo-600/80 dark:text-indigo-300/80" : t.label
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

export default memo(ReportSummary);
