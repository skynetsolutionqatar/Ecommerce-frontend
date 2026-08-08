"use client";

import { memo, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
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
  formatChartAxis,
  tooltipStyle,
} from "@/lib/admin/chart-utils";
import { formatPrice } from "@/lib/utils";
import ChartContainer from "./ChartContainer";
import { ChartExpandDialog } from "./ChartExpandDialog";
import DashboardCard from "./DashboardCard";

interface CategoryBarChartProps {
  title: string;
  description?: string;
  points: ChartPoint[];
}

interface CategoryBarBodyProps {
  chartData: { category: string; revenue: number }[];
  height: number;
  maxBarSize?: number;
}

function CategoryBarBody({ chartData, height, maxBarSize = 40 }: CategoryBarBodyProps) {
  return (
    <ChartContainer height={height}>
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
          tickFormatter={formatChartAxis}
          width={44}
        />
        <Tooltip formatter={(value) => [formatPrice(Number(value)), "Revenue"]} {...tooltipStyle} />
        <Bar
          dataKey="revenue"
          fill={CHART_COLORS.tertiary}
          radius={[4, 4, 0, 0]}
          maxBarSize={maxBarSize}
        />
      </BarChart>
    </ChartContainer>
  );
}

function CategoryBarChart({ title, description, points }: CategoryBarChartProps) {
  const [expanded, setExpanded] = useState(false);

  const chartData = useMemo(
    () => points.map((p) => ({ category: p.label, revenue: p.value })),
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
        <CategoryBarBody chartData={chartData} height={240} />
      </DashboardCard>

      <ChartExpandDialog
        open={expanded}
        onOpenChange={setExpanded}
        title={title}
        description={description}
      >
        <CategoryBarBody chartData={chartData} height={420} maxBarSize={56} />
      </ChartExpandDialog>
    </>
  );
}

export default memo(CategoryBarChart);
