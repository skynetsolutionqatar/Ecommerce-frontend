"use client";

import { memo, useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
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

interface CustomerLineChartProps {
  title: string;
  description?: string;
  points: ChartPoint[];
}

function CustomerLineChart({ title, description, points }: CustomerLineChartProps) {
  const chartData = useMemo(
    () => points.map((p) => ({ month: p.label, customers: p.value })),
    [points]
  );

  return (
    <DashboardCard title={title} description={description} showMenu className="h-full">
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ ...chartMargin, left: 4, bottom: 4 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTickStyle} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={axisTickStyle} width={36} />
            <Tooltip
              formatter={(value) => [value, "New Customers"]}
              labelFormatter={(label) => `Month: ${label}`}
              {...tooltipStyle}
            />
            <Line
              type="monotone"
              dataKey="customers"
              stroke={CHART_COLORS.quaternary}
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#fff", stroke: CHART_COLORS.quaternary, strokeWidth: 2 }}
              activeDot={{ r: 5, fill: CHART_COLORS.quaternary, stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}

export default memo(CustomerLineChart);
