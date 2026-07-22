"use client";

import { memo, useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { SalesDistributionItem } from "@/lib/admin/data";
import { tooltipStyle } from "@/lib/admin/chart-utils";
import { adminType } from "@/lib/admin/typography";
import DashboardCard from "./DashboardCard";

interface SalesDonutChartProps {
  title: string;
  totalLabel: string;
  totalValue: string;
  items: SalesDistributionItem[];
}

function SalesDonutChart({ title, totalLabel, totalValue, items }: SalesDonutChartProps) {
  const pieData = useMemo(
    () =>
      items
        .filter((item) => item.percent > 0)
        .map((item) => ({
          name: item.label,
          value: item.percent,
          color: item.color,
        })),
    [items]
  );

  return (
    <DashboardCard title={title} showMenu className="h-full">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-[180px] w-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={78}
                paddingAngle={2}
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

        <ul className="w-full space-y-2.5">
          {items.map((item) => (
            <li key={item.id} className={`flex items-center justify-between ${adminType.badge}`}>
              <span className="flex items-center gap-2 text-gray-600">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
              <span className={`font-semibold ${adminType.tableCellPrimary}`}>{item.percent}%</span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardCard>
  );
}

export default memo(SalesDonutChart);
