"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchReport } from "@/lib/api/dashboard.api";
import type { ReportQueryParams } from "@/types/reports.types";

export const REPORT_KEY = "report";

export function useReport(type: string, params?: ReportQueryParams) {
  return useQuery({
    queryKey: [REPORT_KEY, type, params],
    queryFn: () => fetchReport(type, params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
    enabled: !!type,
  });
}
