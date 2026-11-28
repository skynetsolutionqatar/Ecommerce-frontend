import { Suspense } from "react";
import AppToaster from "@/components/AppToaster";
import StoreProvider from "@/components/StoreProvider";
import StoreShell from "@/components/store/StoreShell";
import StoreThemeGuard from "@/components/store/StoreThemeGuard";
import GuestActivityTracker from "@/components/store/GuestActivityTracker";
import CookieConsentHost from "@/components/store/CookieConsentHost";
import MobileBrowserChrome from "@/components/store/MobileBrowserChrome";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <StoreProvider>
        <StoreThemeGuard />
        <MobileBrowserChrome />
        <GuestActivityTracker />
        <StoreShell>{children}</StoreShell>
        <CookieConsentHost />
        <AppToaster />
      </StoreProvider>
    </Suspense>
  );
}
