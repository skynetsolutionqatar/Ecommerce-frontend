"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, selectIsAdmin, selectIsAuthenticated } from "@/store/auth.store";
import { API_CONFIG, AUTH_ROUTES } from "@/lib/config";
import { isPlatformHubRole } from "@/lib/Constant";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isAdmin = useAuthStore(selectIsAdmin);
  const role = useAuthStore((s) => s.user?.role);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace(`${AUTH_ROUTES.login}?redirect=/admin/dashboard`);
      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [isHydrated, isAuthenticated, isAdmin, router]);

  if (!isHydrated || !isAuthenticated || !isAdmin) {
    const denied =
      isHydrated &&
      isAuthenticated &&
      !isAdmin &&
      API_CONFIG.developerPortal &&
      !isPlatformHubRole(role);

    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-bg-soft px-6 text-center">
        {!isHydrated || (isAuthenticated && !denied && !isAdmin) ? (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        ) : denied ? (
          <p className="max-w-md text-sm text-muted-foreground">
            This deployment is for platform operators only. Sign in with a developer or owner
            account.
          </p>
        ) : null}
      </div>
    );
  }

  return <>{children}</>;
}
