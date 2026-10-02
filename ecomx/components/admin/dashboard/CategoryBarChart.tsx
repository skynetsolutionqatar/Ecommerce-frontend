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
  valueLabel?: string;
  formatValue?: (value: number) => string;
  /** Vertical bars — better for long search terms / product names. */
  categoryLayout?: "horizontal" | "vertical";
}

interface CategoryBarBodyProps {
  chartData: { category: string; revenue: number }[];
  height: number;
  maxBarSize?: number;
  valueLabel: string;
  formatValue: (value: number) => string;
  categoryLayout: "horizontal" | "vertical";
}

function truncateCategoryLabel(label: string, max = 22): string {
  const t = label.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function CategoryBarBody({
  chartData,
  height,
  maxBarSize = 40,
  valueLabel,
  formatValue,
  categoryLayout,
}: CategoryBarBodyProps) {
  if (chartData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        No data for this period yet.
      </div>
    );
  }

  if (categoryLayout === "vertical") {
    const yAxisWidth = 132;
    return (
      <ChartContainer height={height}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
        >
          <CartesianGrid stroke={CHART_COLORS.grid} horizontal={false} />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={axisTickStyle}
            tickFormatter={formatChartAxis}
          />
          <YAxis
            type="category"
            dataKey="category"
            axisLine={false}
            tickLine={false}
            width={yAxisWidth}
            tick={{
              fontSize: 11,
              fill: CHART_COLORS.axis,
            }}
            tickFormatter={(value) => truncateCategoryLabel(String(value), 18)}
          />
          <Tooltip
            formatter={(value) => [formatValue(Number(value)), valueLabel]}
            labelFormatter={(label) => String(label)}
            {...tooltipStyle}
          />
          <Bar
            dataKey="revenue"
            fill={CHART_COLORS.tertiary}
            radius={[0, 4, 4, 0]}
            maxBarSize={maxBarSize}
          />
        </BarChart>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer height={height}>
      <BarChart data={chartData} margin={{ ...chartMargin, left: 4, bottom: 28, right: 8 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="category"
          axisLine={false}
          tickLine={false}
          tick={{ ...axisTickStyle, fontSize: 11 }}
          interval={0}
          angle={-32}
          textAnchor="end"
          height={72}
          tickFormatter={(value) => truncateCategoryLabel(String(value), 14)}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={axisTickStyle}
          tickFormatter={formatChartAxis}
          width={44}
        />
        <Tooltip
          formatter={(value) => [formatValue(Number(value)), valueLabel]}
          labelFormatter={(label) => String(label)}
          {...tooltipStyle}
        />
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

function CategoryBarChart({
  title,
  description,
  points,
  valueLabel = "Revenue",
  formatValue = formatPrice,
  categoryLayout = "horizontal",
}: CategoryBarChartProps) {
  const [expanded, setExpanded] = useState(false);

  const chartData = useMemo(
    () => points.map((p) => ({ category: p.label, revenue: p.value })),
    [points]
  );

  const compactHeight =
    categoryLayout === "vertical"
      ? Math.min(320, Math.max(240, chartData.length * 36))
      : 240;
  const expandedHeight =
    categoryLayout === "vertical"
      ? Math.min(520, Math.max(420, chartData.length * 44))
      : 420;

  const bodyProps = { chartData, valueLabel, formatValue, categoryLayout };

  return (
    <>
      <DashboardCard
        title={title}
        description={description}
        onExpand={() => setExpanded(true)}
        className="h-full"
      >
        <CategoryBarBody {...bodyProps} height={compactHeight} />
      </DashboardCard>

      <ChartExpandDialog
        open={expanded}
        onOpenChange={setExpanded}
        title={title}
        description={description}
      >
        <CategoryBarBody {...bodyProps} height={expandedHeight} maxBarSize={56} />
      </ChartExpandDialog>
    </>
  );
}

export default memo(CategoryBarChart);
