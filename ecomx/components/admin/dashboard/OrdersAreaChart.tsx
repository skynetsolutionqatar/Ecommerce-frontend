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
import type { ChartPoint } from "@/types/dashboard.types";
import {
  CHART_COLORS,
  axisTickStyle,
  chartMargin,
  tooltipStyle,
} from "@/lib/admin/chart-utils";
import ChartContainer from "./ChartContainer";
import { ChartExpandDialog } from "./ChartExpandDialog";
import DashboardCard from "./DashboardCard";

interface OrdersAreaChartProps {
  title: string;
  description?: string;
  points: ChartPoint[];
}

interface OrdersAreaBodyProps {
  chartData: { label: string; orders: number }[];
  gradientId: string;
  height: number;
}

function OrdersAreaBody({ chartData, gradientId, height }: OrdersAreaBodyProps) {
  return (
    <ChartContainer height={height}>
      <AreaChart data={chartData} margin={{ ...chartMargin, left: 4, bottom: 4 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.secondary} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART_COLORS.secondary} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisTickStyle} dy={8} />
        <YAxis axisLine={false} tickLine={false} tick={axisTickStyle} width={32} />
        <Tooltip
          formatter={(value) => [value, "Orders"]}
          labelFormatter={(label) => `Day: ${label}`}
          {...tooltipStyle}
        />
        <Area
          type="monotone"
          dataKey="orders"
          stroke={CHART_COLORS.secondary}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={{ r: 3, fill: "#fff", stroke: CHART_COLORS.secondary, strokeWidth: 2 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}

function OrdersAreaChart({ title, description, points }: OrdersAreaChartProps) {
  const [expanded, setExpanded] = useState(false);
  const compactGradientId = useId();
  const expandedGradientId = useId();

  const chartData = useMemo(
    () => points.map((p) => ({ label: p.label, orders: p.value })),
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
        <OrdersAreaBody chartData={chartData} gradientId={compactGradientId} height={240} />
      </DashboardCard>

      <ChartExpandDialog
        open={expanded}
        onOpenChange={setExpanded}
        title={title}
        description={description}
      >
        <OrdersAreaBody chartData={chartData} gradientId={expandedGradientId} height={420} />
      </ChartExpandDialog>
    </>
  );
}

export default memo(OrdersAreaChart);
