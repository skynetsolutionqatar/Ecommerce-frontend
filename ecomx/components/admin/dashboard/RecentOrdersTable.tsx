"use client";

import { memo } from "react";
import Link from "next/link";
import type { DashboardOrder } from "@/lib/admin/data";
import { ORDER_STATUS, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/Constant";
import { adminType } from "@/lib/admin/typography";
import DashboardCard from "./DashboardCard";

interface RecentOrdersTableProps {
  title: string;
  viewAllLabel: string;
  viewAllHref: string;
  columns: { key: string; label: string }[];
  rows: DashboardOrder[];
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  [ORDER_STATUS.CONFIRMED]: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  [ORDER_STATUS.PROCESSING]: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
  [ORDER_STATUS.SHIPPED]: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
  [ORDER_STATUS.DELIVERED]: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  [ORDER_STATUS.CANCELLED]: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  [ORDER_STATUS.REFUNDED]: "bg-muted text-muted-foreground",
};

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 ${adminType.badge} ${STATUS_STYLES[status]}`}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

function RecentOrdersTable({
  title,
  viewAllLabel,
  viewAllHref,
  columns,
  rows,
}: RecentOrdersTableProps) {
  return (
    <DashboardCard
      title={title}
      headerRight={
        <Link
          href={viewAllHref}
          className={`${adminType.badge} font-semibold text-emerald-800 hover:underline dark:text-emerald-400`}
        >
          {viewAllLabel}
        </Link>
      }
      className="h-full"
    >
      <div className="overflow-x-auto">
        <table className={`admin-table min-w-[640px] text-left ${adminType.table}`}>
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              {columns.map((col) => (
                <th key={col.key} className={`pb-3 pr-4 last:pr-0 ${adminType.tableHead}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-0 hover:bg-muted/60"
              >
                <td className={`py-3.5 pr-4 font-mono ${adminType.badge} ${adminType.tableCellPrimary}`}>
                  {row.id}
                </td>
                <td className={`py-3.5 pr-4 ${adminType.tableCellPrimary}`}>{row.customer}</td>
                <td className={`py-3.5 pr-4 ${adminType.label}`}>{row.date}</td>
                <td className={`py-3.5 pr-4 ${adminType.label}`}>{row.items}</td>
                <td className="py-3.5 pr-4 font-semibold text-foreground">{row.amount}</td>
                <td className="py-3.5">
                  <OrderStatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}

export default memo(RecentOrdersTable);
