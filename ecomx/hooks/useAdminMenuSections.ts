"use client";

import { useMemo } from "react";
import {
  adminSections,
  platformAdminSection,
  type AdminMenuSection,
} from "@/components/admin/utils/SideSection";
import { useAuthStore, selectCanManageTenants } from "@/store/auth.store";

export function useAdminMenuSections(): AdminMenuSection[] {
  const canManageTenants = useAuthStore(selectCanManageTenants);

  return useMemo(() => {
    if (!canManageTenants) return adminSections;
    return [...adminSections, platformAdminSection];
  }, [canManageTenants]);
}
