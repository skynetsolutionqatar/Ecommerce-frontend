/** Mobile web app shell — matches ecommerce-mobile-app tab bar footprint (no PWA). */
export const MOBILE_TAB_BAR_HEIGHT_PX = 88;
export const MOBILE_TAB_DEALS_OVERHANG_PX = 26;

export const MOBILE_TAB_HIDE_PREFIXES = ["/checkout", "/reset-password"] as const;

export function shopDealsUrl() {
  return "/shop?deals=1";
}

/** Phone layout only. Tablet and desktop start at the `md` breakpoint (768px). */
export function isPhoneViewport(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

export function shouldShowMobileTabBar(pathname: string): boolean {
  return !MOBILE_TAB_HIDE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Store header is hidden on mobile where tab screens provide their own chrome (matches native tabs). */
export function shouldHideStoreHeaderOnMobile(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/shop" ||
    pathname === "/checkout" ||
    pathname === "/account" ||
    pathname.startsWith("/account/")
  );
}

export function isMobileDealsTab(searchParams: URLSearchParams | null): boolean {
  return searchParams?.get("deals") === "1";
}

export function isMobileShopListingTab(searchParams: URLSearchParams | null): boolean {
  return searchParams?.get("listing") === "1";
}

export function isMobileCategoriesTab(pathname: string, searchParams: URLSearchParams | null): boolean {
  if (pathname !== "/shop") return false;
  if (isMobileDealsTab(searchParams)) return false;
  if (isMobileShopListingTab(searchParams)) return false;
  return true;
}

export function isAccountRoute(pathname: string): boolean {
  return pathname === "/account" || pathname.startsWith("/account/");
}

/** Account uses the native-style shell (no store header) through `lg`. */
export function shouldHideHeaderOnAccount(pathname: string): boolean {
  return isAccountRoute(pathname);
}

export const MOBILE_SAFE_TOP = "pt-[max(8px,env(safe-area-inset-top))]";