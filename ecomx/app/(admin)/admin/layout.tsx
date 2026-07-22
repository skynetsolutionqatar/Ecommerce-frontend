"use client";

import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import Navbar from "@/components/admin/main/Navbar";
import Sidebar from "@/components/admin/main/Sidebar";
import "../../admin-globals.css";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="admin-shell h-screen w-full overflow-hidden antialiased font-sans">
        <div className="flex h-screen w-full overflow-hidden">
          <div className="h-full shrink-0 bg-white shadow">
            <Sidebar />
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
        <div className="z-50 h-16 shrink-0 bg-white shadow">
          <Navbar />
        </div>
        <main className="flex-1 overflow-y-auto bg-[#f1f3f6] p-2">{children}</main>
      </div>
        </div>
        <Toaster position="top-right" />
      </div>
    </AdminAuthGuard>
  );
}
