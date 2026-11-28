"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isStandaloneDisplay } from "@/lib/store/display-mode";
import { isPhoneViewport } from "@/lib/store/mobile-chrome";

/**
 * On phone browsers (not installed PWA), nudge document scroll so Chrome/Safari collapse
 * the URL bar — same immersion pattern as large retail mobile sites.
 */
export default function MobileBrowserChrome() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    const root = document.documentElement;
    const standalone = isStandaloneDisplay();
    root.classList.toggle("store-display-standalone", standalone);
    root.classList.toggle("store-display-browser", !standalone && isPhoneViewport());

    if (standalone || !isPhoneViewport()) return;

    const collapseAddressBar = () => {
      const y = window.scrollY;
      if (y < 2) {
        window.scrollTo(0, 1);
      }
    };

    collapseAddressBar();
    const t1 = window.setTimeout(collapseAddressBar, 50);
    const t2 = window.setTimeout(collapseAddressBar, 300);

    const onResize = () => {
      const vh = window.visualViewport?.height;
      if (vh != null && window.innerHeight > vh + 40) collapseAddressBar();
    };
    window.visualViewport?.addEventListener("resize", onResize);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.visualViewport?.removeEventListener("resize", onResize);
      root.classList.remove("store-display-standalone", "store-display-browser");
    };
  }, [pathname]);

  return null;
}