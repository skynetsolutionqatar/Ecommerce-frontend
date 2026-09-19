"use client";

import { memo } from "react";
import {
  reportCellClass,
  reportColumnAlign,
  reportRowClass,
  reportStatusBadgeClass,
  reportTableClass,
  reportTableScrollClass,
} from "@/lib/admin/report-classes";
import type { PaginationMeta } from "@/types/api.types";
import type { ReportTable as ReportTableData } from "@/types/reports.types";
import ReportPagination from "./ReportPagination";

interface ReportTableProps {
  table: ReportTableData;
  page: number;
  pageSize: number;
  pagination?: PaginationMeta;
  onPageChange: (page: number) => void;
}

function ReportTable({
  table,
  page,
  pageSize,
  pagination,
  onPageChange,
}: ReportTableProps) {
  const { columns, rows } = table;
  const total = pagination?.total ?? rows.length;

  return (
    <>
      <div className={reportTableScrollClass}>
        <table className={reportTableClass}>
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">#</th>
              {columns.map((column) => {
                const align = reportColumnAlign(column.key);
                return (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap ${
                      align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {column.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr key={row.id} className={reportRowClass(index)}>
                  <td className="px-4 py-3 text-muted-foreground">
                    {(page - 1) * pageSize + index + 1}
                  </td>
                  {columns.map((column) => {
                    const value = row[column.key] ?? "—";
                    const align = reportColumnAlign(column.key);

                    if (column.key === "status") {
                      return (
                        <td key={`${row.id}-${column.key}`} className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${reportStatusBadgeClass(value)}`}
                          >
                            {value}
                          </span>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={`${row.id}-${column.key}`}
                        className={`px-4 py-3 ${reportCellClass(column.key, value)} ${
                          align === "right" ? "text-right" : "text-left"
                        }`}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-16 text-center text-sm text-muted-foreground"
                >
                  No records found for the selected filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <ReportPagination
          page={page}
          pagination={pagination}
          showing={rows.length}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}

export default memo(ReportTable);
