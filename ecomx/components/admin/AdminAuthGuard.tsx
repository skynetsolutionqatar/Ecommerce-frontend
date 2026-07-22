"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, selectIsAdmin, selectIsAuthenticated } from "@/store/auth.store";
import { AUTH_ROUTES } from "@/lib/config";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isAdmin = useAuthStore(selectIsAdmin);

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
    return (
      <div className="flex h-screen items-center justify-center bg-bg-soft">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
