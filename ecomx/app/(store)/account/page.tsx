import { Suspense } from "react";
import AccountPageClient from "@/components/store/AccountPageClient";

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-sm text-gray-500">Loading account...</p>
      }
    >
      <AccountPageClient />
    </Suspense>
  );
}
