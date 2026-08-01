"use client";

import { useState } from "react";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import AdminThemeProvider from "@/components/admin/AdminThemeProvider";
import Navbar from "@/components/admin/main/Navbar";
import Sidebar from "@/components/admin/main/Sidebar";
import { useAdminTheme } from "@/hooks/useAdminTheme";
import "../../admin-globals.css";
import { Toaster } from "react-hot-toast";

function AdminToaster() {
  const theme = useAdminTheme((state) => state.theme);

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style:
          theme === "dark"
            ? {
                background: "oklch(0.22 0.015 260)",
                color: "oklch(0.96 0 0)",
                border: "1px solid oklch(1 0 0 / 12%)",
              }
            : undefined,
      }}
    />
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <AdminAuthGuard>
      <AdminThemeProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <div className="hidden h-full shrink-0 border-r border-border bg-card shadow-sm md:block">
            <Sidebar />
          </div>

          {mobileNavOpen ? (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-[150] bg-black/50 md:hidden"
                onClick={() => setMobileNavOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 z-[160] md:hidden">
                <Sidebar mobile onNavigate={() => setMobileNavOpen(false)} />
              </div>
            </>
          ) : null}

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="relative z-[100] h-16 shrink-0 border-b border-border bg-card shadow-sm">
              <Navbar onMenuClick={() => setMobileNavOpen(true)} />
            </div>
            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-2 sm:p-3 md:p-4">
              {children}
            </main>
          </div>
        </div>
        <AdminToaster />
      </AdminThemeProvider>
    </AdminAuthGuard>
  );
}
