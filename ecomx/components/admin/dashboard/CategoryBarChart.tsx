"use client";

import { memo, useMemo } from "react";
import {
  Bar,
  BarChart,
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

interface CategoryBarChartProps {
  title: string;
  description?: string;
  points: ChartPoint[];
}

function CategoryBarChart({ title, description, points }: CategoryBarChartProps) {
  const chartData = useMemo(
    () => points.map((p) => ({ category: p.label, revenue: p.value })),
    [points]
  );

  return (
    <DashboardCard title={title} description={description} showMenu className="h-full">
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ ...chartMargin, left: 4, bottom: 4 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis
              dataKey="category"
              axisLine={false}
              tickLine={false}
              tick={axisTickStyle}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={50}
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
              {...tooltipStyle}
            />
            <Bar
              dataKey="revenue"
              fill={CHART_COLORS.tertiary}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}

export default memo(CategoryBarChart);
