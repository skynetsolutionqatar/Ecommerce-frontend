"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { applyStoreTheme } from "@/components/ThemeProvider";
import { getClientConfig } from "@/config/clients";

function resetStoreDocumentTheme() {
  document.documentElement.classList.remove("dark", "admin-theme-transition");
  applyStoreTheme(getClientConfig());
}

/** Clears admin theme leakage and re-applies store tokens (runs before paint when possible). */
export default function StoreThemeGuard() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pathname.startsWith("/admin")) return;
    resetStoreDocumentTheme();
  }, [pathname]);

  useLayoutEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) resetStoreDocumentTheme();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
