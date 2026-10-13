"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ClientConfig } from "@/config/clients/types";
import {
  useStoreTenantQuery,
  useStoreTenantRuntime,
} from "@/hooks/useStoreTenant";
import type { ApiTenant } from "@/types/tenant.types";

interface StoreTenantContextValue {
  tenant: ApiTenant | null;
  mergedClient: ClientConfig;
  googleClientId: string;
  googleOAuthEnabled: boolean;
  isLoading: boolean;
  isError: boolean;
}

const StoreTenantContext = createContext<StoreTenantContextValue | null>(null);

export function useStoreTenant() {
  const ctx = useContext(StoreTenantContext);
  if (!ctx) {
    throw new Error("useStoreTenant must be used within StoreTenantProvider");
  }
  return ctx;
}

/** Optional hook for components that may render outside the store tree (e.g. login page). */
export function useStoreTenantOptional(): StoreTenantContextValue | null {
  return useContext(StoreTenantContext);
}

export default function StoreTenantProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError } = useStoreTenantQuery();
  const runtime = useStoreTenantRuntime(data);

  const value = useMemo<StoreTenantContextValue>(
    () => ({
      tenant: runtime.tenant,
      mergedClient: runtime.mergedClient,
      googleClientId: runtime.googleClientId,
      googleOAuthEnabled: runtime.googleOAuthEnabled,
      isLoading,
      isError,
    }),
    [runtime, isLoading, isError]
  );

  return (
    <StoreTenantContext.Provider value={value}>{children}</StoreTenantContext.Provider>
  );
}
