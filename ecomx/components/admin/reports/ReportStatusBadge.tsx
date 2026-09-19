"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  Confirmed: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  Processing: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  Shipped: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  Delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  Cancelled: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
  Refunded: "bg-gray-50 text-gray-600 dark:bg-muted dark:text-muted-foreground",
};

interface ReportStatusBadgeProps {
  status: string;
}

function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {status}
    </span>
  );
}

export default memo(ReportStatusBadge);
