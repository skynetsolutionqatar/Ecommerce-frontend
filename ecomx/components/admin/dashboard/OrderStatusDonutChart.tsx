"use client";

import { memo, useMemo, useState } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import type { CategoryChartItem } from "@/types/dashboard.types";
import { tooltipStyle } from "@/lib/admin/chart-utils";
import { adminType } from "@/lib/admin/typography";
import ChartContainer from "./ChartContainer";
import { ChartExpandDialog } from "./ChartExpandDialog";
import DashboardCard from "./DashboardCard";

interface OrderStatusDonutChartProps {
  title: string;
  totalLabel: string;
  totalValue: string;
  items: CategoryChartItem[];
}

interface OrderStatusDonutBodyProps {
  pieData: { name: string; value: number; color: string }[];
  totalLabel: string;
  totalValue: string;
  items: CategoryChartItem[];
  pieSize: number;
  innerRadius: number;
  outerRadius: number;
  layout?: "compact" | "expanded";
}

function OrderStatusDonutBody({
  pieData,
  totalLabel,
  totalValue,
  items,
  pieSize,
  innerRadius,
  outerRadius,
  layout = "compact",
}: OrderStatusDonutBodyProps) {
  const isExpanded = layout === "expanded";

  return (
    <div
      className={
        isExpanded
          ? "flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center"
          : "flex flex-col items-center gap-5"
      }
    >
      <div className="relative shrink-0" style={{ width: pieSize, height: pieSize }}>
        <ChartContainer height={pieSize}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
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
        </ChartContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className={isExpanded ? "text-3xl font-bold text-foreground" : adminType.emphasisTotal}>
            {totalValue}
          </span>
          <span className={`${adminType.badge} text-muted-foreground`}>{totalLabel}</span>
        </div>
      </div>

      <ul
        className={
          isExpanded
            ? "grid w-full max-w-lg grid-cols-2 gap-x-6 gap-y-3 lg:flex-1"
            : "grid w-full grid-cols-2 gap-x-4 gap-y-2"
        }
      >
        {items.map((item) => (
          <li key={item.id} className={`flex items-center gap-2 ${adminType.badge}`}>
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate text-muted-foreground">{item.label}</span>
            <span className="ml-auto font-semibold text-foreground">{item.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OrderStatusDonutChart({
  title,
  totalLabel,
  totalValue,
  items,
}: OrderStatusDonutChartProps) {
  const [expanded, setExpanded] = useState(false);

  const pieData = useMemo(
    () => items.map((item) => ({ name: item.label, value: item.value, color: item.color })),
    [items]
  );

  const bodyProps = { pieData, totalLabel, totalValue, items };

  return (
    <>
      <DashboardCard title={title} onExpand={() => setExpanded(true)} className="h-full">
        <OrderStatusDonutBody
          {...bodyProps}
          pieSize={180}
          innerRadius={55}
          outerRadius={78}
          layout="compact"
        />
      </DashboardCard>

      <ChartExpandDialog open={expanded} onOpenChange={setExpanded} title={title}>
        <OrderStatusDonutBody
          {...bodyProps}
          pieSize={280}
          innerRadius={88}
          outerRadius={120}
          layout="expanded"
        />
      </ChartExpandDialog>
    </>
  );
}

export default memo(OrderStatusDonutChart);
