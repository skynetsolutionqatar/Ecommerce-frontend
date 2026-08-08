"use client";

import { memo, useMemo, useState } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import type { CategoryChartItem } from "@/types/dashboard.types";
import { tooltipStyle } from "@/lib/admin/chart-utils";
import { adminType } from "@/lib/admin/typography";
import ChartContainer from "./ChartContainer";
import { ChartExpandDialog } from "./ChartExpandDialog";
import DashboardCard from "./DashboardCard";

interface LabeledPieChartProps {
  title: string;
  description?: string;
  items: CategoryChartItem[];
}

interface LabeledPieBodyProps {
  pieData: { name: string; value: number; color: string }[];
  items: CategoryChartItem[];
  total: number;
  pieSize: number;
  innerRadius: number;
  outerRadius: number;
  layout?: "compact" | "expanded";
}

function LabeledPieBody({
  pieData,
  items,
  total,
  pieSize,
  innerRadius,
  outerRadius,
  layout = "compact",
}: LabeledPieBodyProps) {
  const isExpanded = layout === "expanded";

  return (
    <div
      className={
        isExpanded
          ? "flex flex-col items-center gap-8 lg:flex-row lg:items-center"
          : "flex flex-col gap-6 lg:flex-row lg:items-center"
      }
    >
      <div className={`shrink-0 ${isExpanded ? "" : "mx-auto lg:mx-0"}`}>
        <div className="relative" style={{ width: pieSize, height: pieSize }}>
          <ChartContainer height={pieSize}>
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, _name, item) => [`${value}%`, item.payload?.name ?? ""]}
                {...tooltipStyle}
              />
            </PieChart>
          </ChartContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className={isExpanded ? "text-3xl font-bold text-gray-800" : "text-xl font-bold text-gray-800"}>
              {total}%
            </span>
            <span className={`${adminType.badge} text-gray-500`}>Total</span>
          </div>
        </div>
      </div>

      <ul className={`min-w-0 flex-1 space-y-3 ${isExpanded ? "max-w-lg" : ""}`}>
        {items.map((item) => (
          <li key={item.id}>
            <div className={`mb-1.5 flex items-center justify-between ${adminType.badge}`}>
              <span className="flex min-w-0 items-center gap-2 text-gray-700">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate font-medium">{item.label}</span>
              </span>
              <span className="ml-3 shrink-0 font-semibold text-gray-900">{item.value}%</span>
            </div>
            <div className={`overflow-hidden rounded-full bg-gray-100 ${isExpanded ? "h-3" : "h-2"}`}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${item.value}%`, backgroundColor: item.color }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LabeledPieChart({ title, description, items }: LabeledPieChartProps) {
  const [expanded, setExpanded] = useState(false);

  const pieData = useMemo(
    () => items.map((item) => ({ name: item.label, value: item.value, color: item.color })),
    [items]
  );

  const total = useMemo(() => items.reduce((sum, item) => sum + item.value, 0), [items]);

  const bodyProps = { pieData, items, total };

  return (
    <>
      <DashboardCard
        title={title}
        description={description}
        onExpand={() => setExpanded(true)}
        className="h-full"
      >
        <LabeledPieBody
          {...bodyProps}
          pieSize={200}
          innerRadius={52}
          outerRadius={88}
          layout="compact"
        />
      </DashboardCard>

      <ChartExpandDialog
        open={expanded}
        onOpenChange={setExpanded}
        title={title}
        description={description}
      >
        <LabeledPieBody
          {...bodyProps}
          pieSize={280}
          innerRadius={72}
          outerRadius={120}
          layout="expanded"
        />
      </ChartExpandDialog>
    </>
  );
}

export default memo(LabeledPieChart);
