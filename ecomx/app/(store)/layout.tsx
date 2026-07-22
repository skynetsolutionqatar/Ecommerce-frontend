import { Suspense } from "react";
import StoreProvider from "@/components/StoreProvider";
import NestStore from "@/components/NestStore";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <StoreProvider>
        <NestStore />
        {children}
      </StoreProvider>
    </Suspense>
  );
}
