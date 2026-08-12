"use client";

import { useCallback, useEffect } from "react";
import CheckoutPage from "@/components/CheckoutPage";
import { useStore } from "@/components/StoreProvider";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useMyOrderMutations } from "@/hooks/useOrders";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";
import type { PlaceOrderPayload } from "@/types/order.types";

export default function CheckoutPageClient() {
  const router = useRouter();
  const { cart, setLoginOpen, refreshCart } = useStore();
  const { place } = useMyOrderMutations();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isLoggedIn = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore((s) => s.user);

  const initialContact = user
    ? { fullName: user.name, email: user.email, phone: user.phone ?? "" }
    : undefined;

  useEffect(() => {
    if (isHydrated && !isLoggedIn) setLoginOpen(true);
  }, [isHydrated, isLoggedIn, setLoginOpen]);

  const handlePlaceOrder = useCallback(
    async (payload: PlaceOrderPayload) => {
      try {
        const res = await place.mutateAsync(payload);
        await refreshCart();
        return res.data.order.orderNumber;
      } catch (err) {
        throw new Error(getApiErrorMessage(err, "Could not place order. Please try again."));
      }
    },
    [place, refreshCart]
  );

  return (
    <CheckoutPage
      cart={cart}
      onBack={() => router.push(ROUTES.shop)}
      isLoggedIn={isLoggedIn}
      onLoginOpen={() => setLoginOpen(true)}
      onPlaceOrder={handlePlaceOrder}
      initialContact={initialContact}
    />
  );
}
