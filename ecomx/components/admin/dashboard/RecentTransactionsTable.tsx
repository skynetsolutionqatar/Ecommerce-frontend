import { memo } from "react";
import Link from "next/link";
import type { DashboardTransaction, TransactionStatus } from "@/lib/admin/data";
import { TRANSACTION_STATUS } from "@/lib/Constant";
import { adminType } from "@/lib/admin/typography";
import DashboardCard from "./DashboardCard";

interface RecentTransactionsTableProps {
  title: string;
  viewAllLabel: string;
  viewAllHref: string;
  columns: { key: string; label: string }[];
  rows: DashboardTransaction[];
}

const STATUS_STYLES: Record<TransactionStatus, string> = {
  [TRANSACTION_STATUS.COMPLETED]: "bg-emerald-50 text-emerald-700",
  [TRANSACTION_STATUS.PENDING]: "bg-amber-50 text-amber-700",
  [TRANSACTION_STATUS.FAILED]: "bg-red-50 text-red-600",
};

function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 capitalize ${adminType.badge} ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

function RecentTransactionsTable({
  title,
  viewAllLabel,
  viewAllHref,
  columns,
  rows,
}: RecentTransactionsTableProps) {
  return (
    <DashboardCard
      title={title}
      headerRight={
        <Link
          href={viewAllHref}
          className={`${adminType.badge} font-semibold text-emerald-800 hover:underline`}
        >
          {viewAllLabel}
        </Link>
      }
      className="h-full"
    >
      <div className="overflow-x-auto">
        <table className={`min-w-[520px] text-left ${adminType.table}`}>
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
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
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
              >
                <td className={`py-3.5 pr-4 font-mono ${adminType.badge} ${adminType.tableCellPrimary}`}>
                  {row.id}
                </td>
                <td className={`py-3.5 pr-4 ${adminType.tableCellPrimary}`}>{row.client}</td>
                <td className={`py-3.5 pr-4 ${adminType.label}`}>{row.date}</td>
                <td className={`py-3.5 pr-4 font-semibold text-gray-800`}>{row.amount}</td>
                <td className="py-3.5">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}

export default memo(RecentTransactionsTable);
