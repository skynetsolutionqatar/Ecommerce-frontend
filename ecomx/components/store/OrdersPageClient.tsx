"use client";

import OrdersPage from "@/components/Orders";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function OrdersPageClient() {
  const router = useRouter();

  return <OrdersPage onBack={() => router.push(ROUTES.home)} />;
}
