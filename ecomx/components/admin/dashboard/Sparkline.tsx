"use client";

import { memo, useMemo } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
} from "recharts";
import { toSeriesData } from "@/lib/admin/chart-utils";

interface SparklineProps {
  data: number[];
  type?: "line" | "bar";
  color?: string;
  className?: string;
}

function Sparkline({
  data,
  type = "line",
  color = "#059669",
  className = "",
}: SparklineProps) {
  const chartData = useMemo(() => toSeriesData(data), [data]);

  if (data.length === 0) return null;

  return (
    <div className={`h-9 w-[88px] ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "bar" ? (
          <BarChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
            <Bar
              dataKey="value"
              fill={color}
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default memo(Sparkline);
