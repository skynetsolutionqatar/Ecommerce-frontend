"use client";

import { memo, useMemo, useState } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import type { SalesDistributionItem } from "@/types/dashboard.types";
import { tooltipStyle } from "@/lib/admin/chart-utils";
import { formatPrice } from "@/lib/utils";
import { adminType } from "@/lib/admin/typography";
import ChartContainer from "./ChartContainer";
import { ChartExpandDialog } from "./ChartExpandDialog";
import DashboardCard from "./DashboardCard";

interface SalesDonutChartProps {
  title: string;
  totalLabel: string;
  totalValue: string;
  items: SalesDistributionItem[];
}

interface SalesDonutBodyProps {
  pieData: { name: string; value: number; color: string }[];
  totalLabel: string;
  totalValue: string;
  items: SalesDistributionItem[];
  pieSize: number;
  innerRadius: number;
  outerRadius: number;
  layout?: "compact" | "expanded";
}

function SalesDonutBody({
  pieData,
  totalLabel,
  totalValue,
  items,
  pieSize,
  innerRadius,
  outerRadius,
  layout = "compact",
}: SalesDonutBodyProps) {
  const isExpanded = layout === "expanded";

  return (
    <div
      className={
        isExpanded
          ? "flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center"
          : "flex flex-col items-center gap-6"
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
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, item) => [
                formatPrice(Number(value)),
                item.payload?.name ?? "",
              ]}
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

      <ul className={isExpanded ? "w-full max-w-md space-y-3 lg:flex-1" : "w-full space-y-2.5"}>
        {items.map((item) => (
          <li
            key={item.id}
            className={`flex items-center justify-between ${adminType.badge} ${isExpanded ? "text-sm" : ""}`}
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
            <span className="flex items-center gap-2 font-semibold">
              <span className={adminType.tableCellPrimary}>{formatPrice(item.amount)}</span>
              <span className="text-muted-foreground">{item.percent}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SalesDonutChart({ title, totalLabel, totalValue, items }: SalesDonutChartProps) {
  const [expanded, setExpanded] = useState(false);

  const pieData = useMemo(
    () =>
      items
        .filter((item) => item.amount > 0)
        .map((item) => ({
          name: item.label,
          value: item.amount,
          color: item.color,
        })),
    [items]
  );

  const bodyProps = { pieData, totalLabel, totalValue, items };

  return (
    <>
      <DashboardCard title={title} onExpand={() => setExpanded(true)} className="h-full">
        <SalesDonutBody
          {...bodyProps}
          pieSize={180}
          innerRadius={58}
          outerRadius={78}
          layout="compact"
        />
      </DashboardCard>

      <ChartExpandDialog open={expanded} onOpenChange={setExpanded} title={title}>
        <SalesDonutBody
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

export default memo(SalesDonutChart);
