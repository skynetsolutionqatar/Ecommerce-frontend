"use client";

import { memo, type ReactElement } from "react";
import { ResponsiveContainer } from "recharts";

interface ChartContainerProps {
  height: number;
  children: ReactElement;
  className?: string;
}

function ChartContainer({ height, children, className = "" }: ChartContainerProps) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export default memo(ChartContainer);
