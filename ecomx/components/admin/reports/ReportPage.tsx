"use client";

import { memo, useMemo, useState } from "react";
import PageHeader from "@/components/admin/utils/PageHeader";
import { ListPageShell } from "@/components/admin/shared";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useReport } from "@/hooks/useReport";
import type { ReportQueryParams } from "@/types/reports.types";
import type { ReportType } from "@/lib/admin/reports.config";
import ReportExport from "./ReportExport";
import ReportFilterSection from "./ReportFilterSection";
import ReportSummaryCard from "./ReportSummaryCard";
import ReportTable from "./ReportTable";

const PAGE_SIZE = 10;

interface ReportPageProps {
  reportType: ReportType;
}

function formatFilterLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function ReportPage({ reportType }: ReportPageProps) {
  const [filters, setFilters] = useState<ReportQueryParams>({ period: "30d" });
  const [page, setPage] = useState(1);

  const filterParams = useMemo(() => {
    const params: ReportQueryParams = {};
    if (filters.period) params.period = filters.period;
    if (filters.status) params.status = filters.status;
    if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
    if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
    if (filters.utmSource) params.utmSource = filters.utmSource;
    if (filters.stockStatus) params.stockStatus = filters.stockStatus;
    return params;
  }, [filters]);

  const queryParams = useMemo(
    () => ({
      ...filterParams,
      page,
      limit: PAGE_SIZE,
    }),
    [filterParams, page]
  );

  const { data, isLoading, isFetching, isError, error } = useReport(reportType, queryParams);

  const report = data?.report;
  const pagination = data?.pagination;

  const toolbarFilters = useMemo(() => {
    if (!report?.filterOptions) return [];

    return Object.entries(report.filterOptions).map(([key, field]) => ({
      key,
      label: formatFilterLabel(key),
      value: filters[key as keyof ReportQueryParams] ?? field.value ?? "",
      placeholder: field.options.find((o) => o.value === "")?.label ?? "All",
      options: field.options,
      onChange: (value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1);
      },
    }));
  }, [report?.filterOptions, filters]);

  return (
    <ListPageShell
      isLoading={isLoading}
      isError={isError}
      loadingMessage="Loading report..."
      errorMessage={getApiErrorMessage(error, "Failed to load report")}
    >
      <div className="mx-auto w-full max-w-[1600px] space-y-4">
        <PageHeader
          title={report?.title ?? "Report"}
          description={report?.description}
          actions={
            report?.table ? (
              <ReportExport
                reportType={reportType}
                title={report.title}
                columns={report.table.columns}
                params={filterParams}
              />
            ) : undefined
          }
        />

        {report?.summary && report.summary.length > 0 && (
          <ReportSummaryCard items={report.summary} loading={isFetching && !isLoading} />
        )}

        {report?.table && (
          <div className="admin-report-card overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <ReportFilterSection filters={toolbarFilters} />
            <ReportTable
              table={report.table}
              page={page}
              pageSize={PAGE_SIZE}
              pagination={pagination}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </ListPageShell>
  );
}

export default memo(ReportPage);
