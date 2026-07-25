"use client";

import { memo } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { DashboardLowStockItem } from "@/lib/admin/data";
import { adminType } from "@/lib/admin/typography";
import DashboardCard from "./DashboardCard";

interface LowStockTableProps {
  title: string;
  viewAllLabel: string;
  viewAllHref: string;
  columns: { key: keyof DashboardLowStockItem; label: string }[];
  rows: DashboardLowStockItem[];
}

function StockBadge({ stock, threshold }: { stock: number; threshold: number }) {
  const critical = stock <= Math.floor(threshold / 2);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        critical ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"
      }`}
    >
      {critical && <AlertTriangle size={12} />}
      {stock} left
    </span>
  );
}

function LowStockTable({
  title,
  viewAllLabel,
  viewAllHref,
  rows,
}: LowStockTableProps) {
  return (
    <DashboardCard
      title={title}
      description="Products below their alert threshold — restock soon."
      headerRight={
        <Link
          href={viewAllHref}
          className={`${adminType.badge} font-semibold text-emerald-800 hover:underline dark:text-emerald-400`}
        >
          {viewAllLabel}
        </Link>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {rows.map((row) => {
          const critical = row.stock <= Math.floor(row.threshold / 2);
          return (
            <div
              key={row.id}
              className={`rounded-xl border p-4 transition hover:shadow-sm ${
                critical
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-amber-500/30 bg-amber-500/10"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <StockBadge stock={row.stock} threshold={row.threshold} />
                <span className={`shrink-0 ${adminType.badge} text-muted-foreground`}>
                  ≤ {row.threshold}
                </span>
              </div>
              <p className={`mb-1 line-clamp-2 font-semibold leading-snug text-foreground ${adminType.badge}`}>
                {row.product}
              </p>
              <p className={`font-mono ${adminType.badge} text-muted-foreground`}>{row.sku}</p>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}

export default memo(LowStockTable);
