import { Suspense } from "react";
import AppToaster from "@/components/AppToaster";
import StoreProvider from "@/components/StoreProvider";
import StoreShell from "@/components/store/StoreShell";
import StoreThemeGuard from "@/components/store/StoreThemeGuard";
import GuestActivityTracker from "@/components/store/GuestActivityTracker";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <StoreProvider>
        <StoreThemeGuard />
        <GuestActivityTracker />
        <StoreShell>{children}</StoreShell>
        <AppToaster />
      </StoreProvider>
    </Suspense>
  );
}
