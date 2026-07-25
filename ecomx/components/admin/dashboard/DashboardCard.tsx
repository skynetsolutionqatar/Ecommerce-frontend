"use client";

import { memo, type ReactNode } from "react";
import { adminType } from "@/lib/admin/typography";
import { ChartExpandButton } from "./ChartExpandDialog";

interface DashboardCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  headerRight?: ReactNode;
  onExpand?: () => void;
  className?: string;
  children: ReactNode;
}

function DashboardCard({
  title,
  description,
  action,
  headerRight,
  onExpand,
  className = "",
  children,
}: DashboardCardProps) {
  const hasHeader = title || description || action || headerRight || onExpand;

  return (
    <article
      className={`rounded-xl border border-border bg-card shadow-sm ${className}`}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0 flex-1">
            {title && <h3 className={adminType.cardTitle}>{title}</h3>}
            {description && (
              <p className={`mt-1 leading-relaxed ${adminType.cardDescription}`}>{description}</p>
            )}
            {action}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {headerRight}
            {onExpand && <ChartExpandButton onClick={onExpand} />}
          </div>
        </header>
      )}
      <div className="p-5">{children}</div>
    </article>
  );
}

export default memo(DashboardCard);
