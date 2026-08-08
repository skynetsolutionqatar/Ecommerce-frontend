"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "@/lib/api/dashboard.api";
import { useAuthStore } from "@/store/auth.store";
import type { DashboardQueryParams } from "@/types/dashboard.types";

export const DASHBOARD_KEY = "dashboard";

export function useDashboard(params?: DashboardQueryParams) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: [DASHBOARD_KEY, params],
    queryFn: () => fetchDashboard(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
    enabled: isHydrated && !!accessToken,
  });
}
