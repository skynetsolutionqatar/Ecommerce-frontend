"use client";

import { memo, useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryChartItem } from "@/lib/admin/data";
import { tooltipStyle } from "@/lib/admin/chart-utils";
import { adminType } from "@/lib/admin/typography";
import DashboardCard from "./DashboardCard";

interface LabeledPieChartProps {
  title: string;
  description?: string;
  items: CategoryChartItem[];
}

function LabeledPieChart({ title, description, items }: LabeledPieChartProps) {
  const pieData = useMemo(
    () => items.map((item) => ({ name: item.label, value: item.value, color: item.color })),
    [items]
  );

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.value, 0),
    [items]
  );

  return (
    <DashboardCard title={title} description={description} showMenu className="h-full">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="mx-auto shrink-0 lg:mx-0">
          <div className="relative h-[200px] w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={88}
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
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gray-800">{total}%</span>
              <span className={`${adminType.badge} text-gray-500`}>Total</span>
            </div>
          </div>
        </div>

        <ul className="min-w-0 flex-1 space-y-3">
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
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${item.value}%`, backgroundColor: item.color }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </DashboardCard>
  );
}

export default memo(LabeledPieChart);
