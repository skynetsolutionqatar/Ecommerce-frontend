import apiClient, { triggerBrowserDownload } from "./client";
import { toQueryParams } from "./query-params";
import type { ReportData, ReportQueryParams } from "@/types/reports.types";

function sanitizeFilename(raw: string, fallback: string) {
  const cleaned = raw.replace(/[/\\<>:"|?*\x00-\x1f]/g, "_").slice(0, 200);
  return cleaned || fallback;
}

export async function downloadReportExcel(
  type: string,
  columns: string[],
  params?: ReportQueryParams
) {
  const res = await apiClient.post(
    `/dashboard/reports/${type}/export`,
    { columns },
    {
      params: toQueryParams(params as Record<string, unknown> | undefined),
      responseType: "blob",
    }
  );

  const disposition = res.headers["content-disposition"] || "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = sanitizeFilename(match?.[1] || `${type}-report.xlsx`, `${type}-report.xlsx`);

  triggerBrowserDownload(res.data as Blob, filename);
}

export async function fetchReportExportData(
  type: string,
  params?: ReportQueryParams
): Promise<ReportData> {
  const res = await apiClient.get<{ success: boolean; message: string; data: ReportData }>(
    `/dashboard/reports/${type}`,
    {
      params: toQueryParams({
        ...(params as Record<string, unknown> | undefined),
        export: "1",
        page: 1,
      }),
    }
  );

  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || "Report export data unavailable");
  }

  return res.data.data;
}
