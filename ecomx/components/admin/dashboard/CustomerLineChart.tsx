"use client";

import { memo, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
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

interface CustomerLineChartProps {
  title: string;
  description?: string;
  points: ChartPoint[];
}

interface CustomerLineBodyProps {
  chartData: { month: string; customers: number }[];
  height: number;
}

function CustomerLineBody({ chartData, height }: CustomerLineBodyProps) {
  return (
    <ChartContainer height={height}>
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
    </ChartContainer>
  );
}

function CustomerLineChart({ title, description, points }: CustomerLineChartProps) {
  const [expanded, setExpanded] = useState(false);

  const chartData = useMemo(
    () => points.map((p) => ({ month: p.label, customers: p.value })),
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
        <CustomerLineBody chartData={chartData} height={240} />
      </DashboardCard>

      <ChartExpandDialog
        open={expanded}
        onOpenChange={setExpanded}
        title={title}
        description={description}
      >
        <CustomerLineBody chartData={chartData} height={420} />
      </ChartExpandDialog>
    </>
  );
}

export default memo(CustomerLineChart);
