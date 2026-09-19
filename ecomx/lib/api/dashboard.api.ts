import { apiGet } from "./client";
import type { DashboardData, DashboardQueryParams } from "@/types/dashboard.types";
import type { ReportQueryParams, ReportResult } from "@/types/reports.types";

export async function fetchDashboard(params?: DashboardQueryParams): Promise<DashboardData> {
  const res = await apiGet<DashboardData>(
    "/dashboard",
    params as Record<string, unknown> | undefined
  );
  return res.data;
}

export async function fetchReport(
  type: string,
  params?: ReportQueryParams
): Promise<ReportResult> {
  const res = await apiGet<ReportResult["report"]>(
    `/dashboard/reports/${type}`,
    params as Record<string, unknown> | undefined
  );

  if (!res.success || !res.data) {
    throw new Error(res.message || "Report data unavailable");
  }

  return { report: res.data, pagination: res.pagination };
}
