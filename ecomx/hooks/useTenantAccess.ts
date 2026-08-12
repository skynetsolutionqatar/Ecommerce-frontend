"use client";

import { useAuthStore } from "@/store/auth.store";
import { canManageTenants } from "@/lib/admin/tenant-access";

export function useTenantAccess() {
  const role = useAuthStore((s) => s.user?.role);
  const allowed = canManageTenants(role);

  return {
    canList: allowed,
    canView: allowed,
    canCreate: allowed,
    canUpdate: allowed,
    canDelete: allowed,
  };
}
