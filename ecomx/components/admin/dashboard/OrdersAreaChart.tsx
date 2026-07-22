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
import type { ChartPoint } from "@/lib/admin/data";
import {
  CHART_COLORS,
  axisTickStyle,
  chartMargin,
  tooltipStyle,
} from "@/lib/admin/chart-utils";
import DashboardCard from "./DashboardCard";

interface OrdersAreaChartProps {
  title: string;
  description?: string;
  points: ChartPoint[];
}

function OrdersAreaChart({ title, description, points }: OrdersAreaChartProps) {
  const chartData = useMemo(
    () => points.map((p) => ({ label: p.label, orders: p.value })),
    [points]
  );

  return (
    <DashboardCard title={title} description={description} showMenu className="h-full">
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ ...chartMargin, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="ordersAreaGradient" x1="0" y1="0" x2="0" y2="1">
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
              fill="url(#ordersAreaGradient)"
              dot={{ r: 3, fill: "#fff", stroke: CHART_COLORS.secondary, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}

export default memo(OrdersAreaChart);
