"use client";

import { memo, useId, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RevenueTrendPoint } from "@/types/dashboard.types";
import {
  CHART_COLORS,
  axisTickStyle,
  chartMargin,
  formatChartAxis,
  tooltipStyle,
} from "@/lib/admin/chart-utils";
import { formatPrice } from "@/lib/utils";
import ChartContainer from "./ChartContainer";
import { ChartExpandDialog } from "./ChartExpandDialog";
import DashboardCard from "./DashboardCard";

interface RevenueTrendChartProps {
  title: string;
  description: string;
  points: RevenueTrendPoint[];
}

interface RevenueChartBodyProps {
  chartData: { month: string; revenue: number }[];
  gradientId: string;
  height: number;
}

function RevenueChartBody({ chartData, gradientId, height }: RevenueChartBodyProps) {
  return (
    <ChartContainer height={height}>
      <AreaChart data={chartData} margin={{ ...chartMargin, left: 4, bottom: 4 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
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
          tickFormatter={formatChartAxis}
          width={44}
        />

        <Tooltip
          formatter={(value) => [formatPrice(Number(value)), "Revenue"]}
          labelFormatter={(label) => `Month: ${label}`}
          {...tooltipStyle}
        />

        <Area
          type="monotone"
          dataKey="revenue"
          stroke={CHART_COLORS.primary}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={{ r: 4, fill: "#fff", stroke: CHART_COLORS.primary, strokeWidth: 2 }}
          activeDot={{ r: 5, fill: CHART_COLORS.primary, stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}

function RevenueTrendChart({ title, description, points }: RevenueTrendChartProps) {
  const [expanded, setExpanded] = useState(false);
  const compactGradientId = useId();
  const expandedGradientId = useId();

  const chartData = useMemo(
    () => points.map((p) => ({ month: p.month, revenue: p.value })),
    [points]
  );

  return (
    <>
      <DashboardCard
        title={title}
        description={description}
        onExpand={() => setExpanded(true)}
        className="h-full"
      >
        <RevenueChartBody chartData={chartData} gradientId={compactGradientId} height={260} />
      </DashboardCard>

      <ChartExpandDialog
        open={expanded}
        onOpenChange={setExpanded}
        title={title}
        description={description}
      >
        <RevenueChartBody chartData={chartData} gradientId={expandedGradientId} height={420} />
      </ChartExpandDialog>
    </>
  );
}

export default memo(RevenueTrendChart);
