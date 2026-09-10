import { memo } from "react";
import Link from "next/link";
import type { DashboardTransaction } from "@/types/dashboard.types";
import type { PaginationMeta } from "@/types/api.types";
import { TRANSACTION_STATUS, TRANSACTION_STATUS_LABEL, type TransactionStatus } from "@/lib/Constant";
import { adminType } from "@/lib/admin/typography";
import { colors } from "@/components/admin/utils/Colors";
import ListPagination from "@/components/admin/shared/ListPagination";
import DashboardCard from "./DashboardCard";

const COLUMNS = [
  "Transaction ID",
  "Client",
  "Date",
  "Amount",
  "Status",
] as const;

interface RecentTransactionsTableProps {
  title: string;
  viewAllLabel: string;
  viewAllHref: string;
  rows: DashboardTransaction[];
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

const STATUS_STYLES: Record<TransactionStatus, string> = {
  [TRANSACTION_STATUS.COMPLETED]: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  [TRANSACTION_STATUS.PENDING]: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  [TRANSACTION_STATUS.FAILED]: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  [TRANSACTION_STATUS.REFUNDED]: "bg-muted text-muted-foreground",
};

function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 ${adminType.badge} ${STATUS_STYLES[status]}`}
    >
      {TRANSACTION_STATUS_LABEL[status]}
    </span>
  );
}

function RecentTransactionsTable({
  title,
  viewAllLabel,
  viewAllHref,
  rows,
  pagination,
  onPageChange,
}: RecentTransactionsTableProps) {
  return (
    <DashboardCard
      title={title}
      headerRight={
        <Link
          href={viewAllHref}
          className={`${adminType.badge} font-semibold ${colors.link}`}
        >
          {viewAllLabel}
        </Link>
      }
      className="h-full"
    >
      <div className="overflow-x-auto">
        <table className={`admin-table min-w-[520px] text-left ${adminType.table}`}>
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              {COLUMNS.map((label) => (
                <th key={label} className={`pb-3 pr-4 last:pr-0 ${adminType.tableHead}`}>
                  {label}
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
                <td className={`py-3.5 pr-4 ${adminType.tableCellPrimary}`}>{row.client}</td>
                <td className={`py-3.5 pr-4 ${adminType.label}`}>{row.date}</td>
                <td className="py-3.5 pr-4 font-semibold text-foreground">{row.amount}</td>
                <td className="py-3.5">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && onPageChange && pagination.totalPages > 1 && (
        <ListPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          showing={rows.length}
          onPageChange={onPageChange}
          hasNext={pagination.hasNextPage}
        />
      )}
    </DashboardCard>
  );
}

export default memo(RecentTransactionsTable);
