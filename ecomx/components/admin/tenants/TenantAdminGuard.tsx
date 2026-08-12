"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { canManageTenants } from "@/lib/admin/tenant-access";
import { ADMIN_ROUTES } from "@/lib/config";
import { adminType } from "@/lib/admin/typography";

export default function TenantAdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const role = useAuthStore((s) => s.user?.role);
  const allowed = canManageTenants(role);

  useEffect(() => {
    if (isHydrated && !allowed) {
      router.replace(ADMIN_ROUTES.dashboard);
    }
  }, [isHydrated, allowed, router]);

  if (!isHydrated || !allowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        {!isHydrated ? (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        ) : (
          <p className={adminType.error}>You do not have permission to manage stores.</p>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
