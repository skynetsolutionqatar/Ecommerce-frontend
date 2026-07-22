"use client";

import { memo } from "react";
import { lazyClient } from "@/lib/lazy";

const AdminDashboard = lazyClient(() => import("@/components/admin/dashboard/AdminDashboard"), {
  ssr: false,
});

function AdminDashboardPage() {
  return <AdminDashboard />;
}

export default memo(AdminDashboardPage);
