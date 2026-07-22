"use client";

import { memo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { PerformanceMetric } from "@/lib/admin/data";
import { CHART_COLORS } from "@/lib/admin/chart-utils";
import { adminType } from "@/lib/admin/typography";
import DashboardCard from "./DashboardCard";

interface PerformanceMetricsCardProps {
  metrics: PerformanceMetric[];
}

function MetricBar({ metric }: { metric: PerformanceMetric }) {
  const data = [{ label: metric.label, percent: metric.percent }];

  return (
    <li>
      <div className="mb-2 flex items-center justify-between">
        <span className={adminType.metricLabel}>{metric.label}</span>
        <span className={adminType.value}>{metric.value}</span>
      </div>
      <div className="h-2.5 w-full">
        <ResponsiveContainer width="100%" height="100%">
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
              barSize={10}
              background={{ fill: CHART_COLORS.track, radius: 4 }}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </li>
  );
}

function PerformanceMetricsCard({ metrics }: PerformanceMetricsCardProps) {
  return (
    <DashboardCard title="Performance Metrics" showMenu className="h-full">
      <ul className="space-y-6">
        {metrics.map((metric) => (
          <MetricBar key={metric.id} metric={metric} />
        ))}
      </ul>
    </DashboardCard>
  );
}

export default memo(PerformanceMetricsCard);
