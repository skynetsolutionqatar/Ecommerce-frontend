/** True when the storefront runs without browser URL chrome (PWA / Add to Home Screen). */
export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const navigatorStandalone = (navigator as Navigator & { standalone?: boolean }).standalone;
  return (
    navigatorStandalone === true ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches
  );
}