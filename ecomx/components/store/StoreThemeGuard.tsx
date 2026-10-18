"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { applyStoreTheme } from "@/components/ThemeProvider";
import { getClientConfig } from "@/config/clients";
/** Clears admin theme leakage and re-applies store tokens (runs before paint when possible). */
export default function StoreThemeGuard() {
  const pathname = usePathname();
  const client = getClientConfig();

  useLayoutEffect(() => {
    if (pathname.startsWith("/admin")) return;
    document.documentElement.classList.remove("dark", "admin-theme-transition");
    applyStoreTheme(client);
  }, [pathname, client]);

  useLayoutEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted && !pathname.startsWith("/admin")) {
        document.documentElement.classList.remove("dark", "admin-theme-transition");
        applyStoreTheme(client);
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [pathname, client]);

  return null;
}
