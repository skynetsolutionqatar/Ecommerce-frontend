"use client";

import { useEffect } from "react";
import OrdersPage from "@/components/Orders";
import { useStore } from "@/components/StoreProvider";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";

export default function OrdersPageClient() {
  const router = useRouter();
  const { setLoginOpen } = useStore();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isLoggedIn = useAuthStore(selectIsAuthenticated);

  useEffect(() => {
    if (isHydrated && !isLoggedIn) setLoginOpen(true);
  }, [isHydrated, isLoggedIn, setLoginOpen]);

  return (
    <OrdersPage
      onBack={() => router.push(ROUTES.shop)}
      isLoggedIn={isLoggedIn}
      isHydrated={isHydrated}
      onLoginOpen={() => setLoginOpen(true)}
    />
  );
}
