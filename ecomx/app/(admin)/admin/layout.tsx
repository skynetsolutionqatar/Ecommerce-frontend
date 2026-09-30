"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import AdminThemeProvider from "@/components/admin/AdminThemeProvider";
import Navbar from "@/components/admin/main/Navbar";
import Sidebar from "@/components/admin/main/Sidebar";
import { colors } from "@/components/admin/utils/Colors";
import { useAdminTheme } from "@/hooks/useAdminTheme";
import { cn } from "@/lib/utils";
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
  const mainRef = useRef<HTMLElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const checkScrollBottom = useCallback(() => {
    const main = mainRef.current;
    if (!main) return;
    const el =
      main.querySelector<HTMLElement>("[data-admin-panel-scroll]") ?? main;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 4;
    setIsAtBottom(atBottom);
  }, []);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const scrollEl =
      main.querySelector<HTMLElement>("[data-admin-panel-scroll]") ?? main;

    checkScrollBottom();
    scrollEl.addEventListener("scroll", checkScrollBottom, { passive: true });

    const resizeObserver = new ResizeObserver(checkScrollBottom);
    resizeObserver.observe(scrollEl);
    resizeObserver.observe(main);

    return () => {
      scrollEl.removeEventListener("scroll", checkScrollBottom);
      resizeObserver.disconnect();
    };
  }, [checkScrollBottom]);

  return (
    <AdminAuthGuard>
      <AdminThemeProvider>
        <div className="flex h-screen max-h-screen min-h-0 w-full overflow-hidden">
          <div className="hidden h-full min-h-0 shrink-0 md:block">
            <Sidebar />
          </div>

          {mobileNavOpen ? (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-[150] cursor-pointer bg-black/50 md:hidden"
                onClick={() => setMobileNavOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 z-[160] md:hidden">
                <Sidebar mobile onNavigate={() => setMobileNavOpen(false)} />
              </div>
            </>
          ) : null}

          <div
            className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${colors.mainColor}`}
          >
            <div className="relative z-[100] h-16 shrink-0">
              <Navbar onMenuClick={() => setMobileNavOpen(true)} />
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2 pt-0 md:p-3 md:pt-0">
              <main
                ref={mainRef}
                className={cn(
                  "min-h-0 flex-1 overflow-hidden rounded-t-xl bg-background p-2 shadow-sm ring-1 ring-border/50 transition-[border-radius] duration-200 sm:p-3 md:p-4 dark:ring-border/30",
                  isAtBottom && "rounded-bl-xl rounded-br-xl",
                )}
              >
                {children}
              </main>
            </div>
          </div>
        </div>
        <AdminToaster />
      </AdminThemeProvider>
    </AdminAuthGuard>
  );
}
