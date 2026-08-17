"use client";

import { memo } from "react";
import { lazyClient } from "@/lib/lazy";
import type { DashboardStat } from "@/types/dashboard.types";
import { adminType } from "@/lib/admin/typography";
import { formatTrend } from "@/lib/admin/chart-utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const Sparkline = lazyClient(() => import("./Sparkline"), { ssr: false });
const ProgressRing = lazyClient(() => import("./ProgressRing"), { ssr: false });

interface StatCardProps {
  stat: DashboardStat;
}

function StatCard({ stat }: StatCardProps) {
  const isUp = stat.trend.direction === "up";
  const trendColor = isUp ? "text-emerald-600" : "text-red-500";
  const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className={`mb-3 ${adminType.label}`}>{stat.label}</p>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold leading-none text-foreground">{stat.value}</p>
          <p className={`mt-2 flex items-center gap-0.5 ${adminType.badge} font-semibold ${trendColor}`}>
            <TrendIcon size={14} />
            {formatTrend(stat.trend.value, stat.trend.direction)}
          </p>
        </div>

        {stat.ringPercent != null ? (
          <ProgressRing percent={stat.ringPercent} />
        ) : (
          <Sparkline
            data={stat.sparkline}
            type={stat.sparklineType}
            color={stat.sparklineColor}
          />
        )}
      </div>
    </article>
  );
}

export default memo(StatCard);
