"use client";

import { memo, useState } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import type { PerformanceMetric } from "@/types/dashboard.types";
import { CHART_COLORS } from "@/lib/admin/chart-utils";
import { adminType } from "@/lib/admin/typography";
import ChartContainer from "./ChartContainer";
import { ChartExpandDialog } from "./ChartExpandDialog";
import DashboardCard from "./DashboardCard";

interface PerformanceMetricsCardProps {
  metrics: PerformanceMetric[];
}

interface MetricBarProps {
  metric: PerformanceMetric;
  barHeight: number;
  barSize: number;
}

function MetricBar({ metric, barHeight, barSize }: MetricBarProps) {
  const data = [{ label: metric.label, percent: metric.percent }];

  return (
    <li>
      <div className="mb-2 flex items-center justify-between">
        <span className={adminType.metricLabel}>{metric.label}</span>
        <span className={adminType.value}>{metric.value}</span>
      </div>
      <div className="w-full" style={{ height: barHeight }}>
        <ChartContainer height={barHeight}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="label" hide />
            <Bar
              dataKey="percent"
              fill={metric.color}
              radius={[4, 4, 4, 4]}
              barSize={barSize}
              background={{ fill: CHART_COLORS.track, radius: 4 }}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </li>
  );
}

interface PerformanceMetricsBodyProps {
  metrics: PerformanceMetric[];
  spacing: string;
  barHeight: number;
  barSize: number;
}

function PerformanceMetricsBody({
  metrics,
  spacing,
  barHeight,
  barSize,
}: PerformanceMetricsBodyProps) {
  return (
    <ul className={spacing}>
      {metrics.map((metric) => (
        <MetricBar key={metric.id} metric={metric} barHeight={barHeight} barSize={barSize} />
      ))}
    </ul>
  );
}

function PerformanceMetricsCard({ metrics }: PerformanceMetricsCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <DashboardCard title="Performance Metrics" onExpand={() => setExpanded(true)} className="h-full">
        <PerformanceMetricsBody
          metrics={metrics}
          spacing="space-y-6"
          barHeight={10}
          barSize={10}
        />
      </DashboardCard>

      <ChartExpandDialog
        open={expanded}
        onOpenChange={setExpanded}
        title="Performance Metrics"
        description="Key performance indicators at a glance"
      >
        <PerformanceMetricsBody
          metrics={metrics}
          spacing="space-y-8"
          barHeight={16}
          barSize={16}
        />
      </ChartExpandDialog>
    </>
  );
}

export default memo(PerformanceMetricsCard);
