"use client";

import { memo, useMemo } from "react";
import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { CHART_COLORS } from "@/lib/admin/chart-utils";
import { adminType } from "@/lib/admin/typography";

interface ProgressRingProps {
  percent: number;
  color?: string;
  label?: string;
}

function ProgressRing({ percent, color = CHART_COLORS.primary, label }: ProgressRingProps) {
  const data = useMemo(
    () => [{ name: "progress", value: Math.min(100, Math.max(0, percent)), fill: color }],
    [percent, color]
  );

  return (
    <div className="relative h-14 w-14">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="72%"
          outerRadius="100%"
          barSize={6}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            background={{ fill: CHART_COLORS.track }}
            dataKey="value"
            cornerRadius={4}
            isAnimationActive={false}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      {label && (
        <span className={`absolute inset-0 flex items-center justify-center ${adminType.badge} font-bold text-gray-700`}>
          {label}
        </span>
      )}
    </div>
  );
}

export default memo(ProgressRing);
