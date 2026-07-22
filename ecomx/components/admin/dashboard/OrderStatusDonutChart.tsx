"use client";

import { memo, useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryChartItem } from "@/lib/admin/data";
import { tooltipStyle } from "@/lib/admin/chart-utils";
import { adminType } from "@/lib/admin/typography";
import DashboardCard from "./DashboardCard";

interface OrderStatusDonutChartProps {
  title: string;
  totalLabel: string;
  totalValue: string;
  items: CategoryChartItem[];
}

function OrderStatusDonutChart({
  title,
  totalLabel,
  totalValue,
  items,
}: OrderStatusDonutChartProps) {
  const pieData = useMemo(
    () => items.map((item) => ({ name: item.label, value: item.value, color: item.color })),
    [items]
  );

  return (
    <DashboardCard title={title} showMenu className="h-full">
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-[180px] w-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={78}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
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
            <span className={adminType.emphasisTotal}>{totalValue}</span>
            <span className={`${adminType.badge} text-gray-500`}>{totalLabel}</span>
          </div>
        </div>

        <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2">
          {items.map((item) => (
            <li key={item.id} className={`flex items-center gap-2 ${adminType.badge}`}>
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-gray-600">{item.label}</span>
              <span className="ml-auto font-semibold text-gray-800">{item.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardCard>
  );
}

export default memo(OrderStatusDonutChart);
