"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getClientConfig } from "@/config/clients";
import { fetchStoreTenant } from "@/lib/api/tenant.api";
import { API_CONFIG } from "@/lib/config";
import {
  mergeTenantIntoClient,
  resolveStoreGoogleClientId,
} from "@/lib/store/merge-tenant-client";
import type { ApiTenant } from "@/types/tenant.types";

export const STORE_TENANT_KEY = "store-tenant";

export function useStoreTenantQuery(enabled = true) {
  const slug = API_CONFIG.tenantSlug;
  const tenantId = API_CONFIG.tenantId;

  return useQuery({
    queryKey: [STORE_TENANT_KEY, tenantId, slug],
    queryFn: () => fetchStoreTenant(slug, tenantId),
    enabled: enabled && Boolean(slug || tenantId),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useStoreTenantRuntime(tenant?: ApiTenant | null) {
  const baseClient = useMemo(() => getClientConfig(), []);

  return useMemo(() => {
    const mergedClient = mergeTenantIntoClient(baseClient, tenant);
    const googleClientId = resolveStoreGoogleClientId(tenant);
    const googleOAuthEnabled = Boolean(googleClientId);

    return {
      tenant: tenant ?? null,
      mergedClient,
      googleClientId,
      googleOAuthEnabled,
    };
  }, [baseClient, tenant]);
}
