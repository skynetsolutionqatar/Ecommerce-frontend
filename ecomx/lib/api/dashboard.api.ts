import { apiGet } from "./client";
import type { DashboardData, DashboardQueryParams } from "@/types/dashboard.types";

export async function fetchDashboard(params?: DashboardQueryParams): Promise<DashboardData> {
  const res = await apiGet<DashboardData>(
    "/dashboard",
    params as Record<string, unknown> | undefined
  );
  return res.data;
}
