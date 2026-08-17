"use client";

import { memo, useMemo } from "react";
import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { CHART_COLORS } from "@/lib/admin/chart-utils";

interface ProgressRingProps {
  percent: number;
  color?: string;
}

function ProgressRing({ percent, color = CHART_COLORS.primary }: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const data = useMemo(
    () => [{ name: "progress", value: clamped, fill: color }],
    [clamped, color]
  );
  const centerLabel = `${Math.round(clamped)}%`;

  return (
    <div className="relative h-16 w-16 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={7}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            background={{ fill: CHART_COLORS.track }}
            dataKey="value"
            max={100}
            cornerRadius={4}
            isAnimationActive={false}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold leading-none tabular-nums text-gray-700">
        {centerLabel}
      </span>
    </div>
  );
}

export default memo(ProgressRing);
