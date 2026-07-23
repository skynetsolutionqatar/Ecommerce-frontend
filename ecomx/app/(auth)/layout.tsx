export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a255d] via-[#111827] to-[#1F2937] p-4 sm:p-6">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#0a255d]/40 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-white/[0.03] blur-2xl" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative z-10 w-full max-w-[440px] animate-fade-up">
        <p className="mb-5 text-center font-label text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
          Skynet Management Suite
        </p>
        {children}
      </div>
    </div>
  );
}
