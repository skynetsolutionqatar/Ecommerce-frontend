import { Suspense } from "react";
import AppToaster from "@/components/AppToaster";
import StoreProvider from "@/components/StoreProvider";
import StoreShell from "@/components/store/StoreShell";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <StoreProvider>
        <StoreShell>{children}</StoreShell>
        <AppToaster />
      </StoreProvider>
    </Suspense>
  );
}
