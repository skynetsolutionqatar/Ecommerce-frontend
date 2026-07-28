"use client";

import CheckoutPage from "@/components/CheckoutPage";
import { useStore } from "@/components/StoreProvider";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function CheckoutPageClient() {
  const router = useRouter();
  const { cart } = useStore();

  return (
    <CheckoutPage
      cart={cart}
      onBack={() => router.push(ROUTES.shop)}
    />
  );
}
