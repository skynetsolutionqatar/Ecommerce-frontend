"use client";

import { memo, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RevenueTrendPoint } from "@/lib/admin/data";
import {
  CHART_COLORS,
  axisTickStyle,
  chartMargin,
  tooltipStyle,
} from "@/lib/admin/chart-utils";
import DashboardCard from "./DashboardCard";

interface RevenueTrendChartProps {
  title: string;
  description: string;
  points: RevenueTrendPoint[];
}

function RevenueTrendChart({ title, description, points }: RevenueTrendChartProps) {
  const chartData = useMemo(
    () => points.map((p) => ({ month: p.month, revenue: p.value })),
    [points]
  );

  return (
    <DashboardCard title={title} description={description} showMenu className="h-full">
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ ...chartMargin, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} strokeDasharray="0" />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={axisTickStyle}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={axisTickStyle}
              tickFormatter={(v: number) => `${v}k`}
              width={36}
            />

            <Tooltip
              formatter={(value) => [`${value}k`, "Revenue"]}
              labelFormatter={(label) => `Month: ${label}`}
              {...tooltipStyle}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke={CHART_COLORS.primary}
              strokeWidth={2.5}
              fill="url(#revenueAreaGradient)"
              dot={{ r: 4, fill: "#fff", stroke: CHART_COLORS.primary, strokeWidth: 2 }}
              activeDot={{ r: 5, fill: CHART_COLORS.primary, stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}

export default memo(RevenueTrendChart);
