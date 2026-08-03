import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import AppToaster from "@/components/AppToaster";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AuthBrandPanel />

      <main className="relative flex flex-1 items-center justify-center bg-[#fafbfd] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="pointer-events-none absolute inset-0 lg:left-[44%] lg:max-w-none [background:radial-gradient(ellipse_at_top_right,rgba(10,37,93,0.04),transparent_55%)]" />
        <div className="relative w-full max-w-[420px]">{children}</div>
      </main>
      <AppToaster />
    </div>
  );
}
