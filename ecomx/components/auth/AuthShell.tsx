import Link from "next/link";
import { Layers } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
      <div className="relative bg-gradient-to-br from-[#0a255d] via-primary-mid to-accent px-8 pb-7 pt-8 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_55%)]" />
        <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-sm">
          <Layers className="h-7 w-7 text-white" strokeWidth={2.25} />
        </div>
        <h1 className="relative font-display text-[26px] font-bold text-white">{title}</h1>
        <p className="relative mt-1.5 text-[13px] text-white/60">{subtitle}</p>
      </div>

      <div className="px-8 pb-8 pt-6">{children}</div>
    </div>
  );
}

export const authInputClass =
  "w-full rounded-xl border-[1.5px] border-border bg-bg-soft px-3.5 py-3 text-sm text-primary outline-none transition-[border-color,box-shadow] placeholder:text-muted/60 focus:border-accent focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_12%,transparent)]";

export function AuthFormField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-primary/80">
        <span className="flex text-accent">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{message}</p>
  );
}

export function AuthOutlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-border bg-white px-7 py-3 font-label text-sm font-semibold text-primary transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-[0_2px_12px_color-mix(in_srgb,var(--color-accent)_15%,transparent)]"
    >
      {children}
    </Link>
  );
}

export function AuthGoToStoreLink() {
  return <AuthOutlineLink href="/">← Go to Store</AuthOutlineLink>;
}

export function AuthFormDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted">or</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function AuthSubmitButton({
  loading,
  loadingLabel,
  label,
}: {
  loading: boolean;
  loadingLabel: string;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#0a255d] to-accent px-8 py-3.5 font-label text-sm font-bold text-white shadow-[0_4px_20px_color-mix(in_srgb,var(--color-accent)_35%,transparent)] transition-all duration-300 hover:-translate-y-0.5 hover:from-accent-hover hover:to-primary-light disabled:translate-y-0 disabled:opacity-60"
    >
      {loading ? (
        <>
          <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}
