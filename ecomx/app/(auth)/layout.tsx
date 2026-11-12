import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import AppToaster from "@/components/AppToaster";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-col lg:flex-row">
      <AuthBrandPanel />

      <main className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain bg-[#fafbfd] px-4 py-6 sm:px-8 sm:py-10 lg:items-center lg:justify-center lg:px-12 lg:py-16">
        <div className="pointer-events-none absolute inset-0 lg:left-[44%] lg:max-w-none [background:radial-gradient(ellipse_at_top_right,rgba(10,37,93,0.04),transparent_55%)]" />
        <div className="relative mx-auto w-full max-w-[420px] shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.25rem,env(safe-area-inset-top))]">
          {children}
        </div>
      </main>
      <AppToaster />
    </div>
  );
}
