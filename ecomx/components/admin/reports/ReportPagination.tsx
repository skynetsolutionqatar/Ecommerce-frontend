"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { colors } from "@/components/admin/utils/Colors";
import { reportPaginationClass } from "@/lib/admin/report-classes";
import type { PaginationMeta } from "@/types/api.types";

interface ReportPaginationProps {
  page: number;
  pagination?: PaginationMeta;
  showing: number;
  onPageChange: (page: number) => void;
}

function getVisiblePages(current: number, total: number, max = 5): number[] {
  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let end = start + max - 1;

  if (end > total) {
    end = total;
    start = Math.max(1, end - max + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function ReportPagination({ page, pagination, showing, onPageChange }: ReportPaginationProps) {
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);
  const total = pagination?.total ?? showing;
  const hasNext = pagination?.hasNextPage ?? page < totalPages;
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className={reportPaginationClass}>
      <p className="text-muted-foreground">
        Showing <span className="font-medium text-foreground">{showing}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span>
      </p>
      <div className="flex flex-wrap items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page === 1}
        >
          Prev
        </Button>
        {visiblePages.map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={page === pageNumber ? "default" : "outline"}
            size="sm"
            className={`min-w-8 ${page === pageNumber ? colors.activePage : ""}`}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          disabled={!hasNext || page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default memo(ReportPagination);
