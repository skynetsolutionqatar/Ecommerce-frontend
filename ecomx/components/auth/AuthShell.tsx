"use client";

import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import { useState } from "react";
import * as Icons from "@/components/Icons";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <p className="mb-2 font-label text-sm font-bold tracking-wide text-[#0a255d]">Skynet™</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight text-primary sm:text-[32px]">
          {title}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

export const authInputClass =
  "w-full rounded-xl border border-border/80 bg-white px-4 py-3.5 text-sm text-primary shadow-[0_1px_2px_rgba(17,24,39,0.04)] outline-none transition-all placeholder:text-muted/50 focus:border-[#0a255d] focus:shadow-[0_0_0_3px_rgba(10,37,93,0.1)]";

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
      <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary/70">
        <span className="flex text-[#0a255d]/70">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

export function AuthPhoneField({
  id = "phone",
  label = "Phone (Qatar)",
  value,
  onChange,
  required = true,
}: {
  id?: string;
  label?: string;
  value: string;
  onChange: (digits: string) => void;
  required?: boolean;
}) {
  return (
    <AuthFormField label={label} icon={<Icons.Phone />}>
      <div className="flex overflow-hidden rounded-xl border border-border/80 bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04)] focus-within:border-[#0a255d] focus-within:shadow-[0_0_0_3px_rgba(10,37,93,0.1)]">
        <span className="flex items-center border-r border-border/80 bg-bg-soft px-3 text-sm font-semibold text-primary">
          +974
        </span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          required={required}
          maxLength={8}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 8))}
          className="w-full border-0 bg-transparent px-4 py-3.5 text-sm text-primary outline-none placeholder:text-muted/50"
          placeholder="51882350"
          autoComplete="tel-national"
        />
      </div>
    </AuthFormField>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
      <span className="mt-0.5 flex h-5 w-5 md:h-4 md:w-4 shrink-0 items-center justify-center rounded-full bg-red-100 text-[12px] md:text-[10px] font-bold">
        !
      </span>
      {message}
    </div>
  );
}

export function AuthPasswordField({
  label,
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthFormField label={label} icon={<Icons.Lock />}>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${authInputClass} pr-12`}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-primary/60 transition-colors hover:bg-bg-soft hover:text-[#0a255d]"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <Icons.EyeOff /> : <Icons.Eye />}
        </button>
      </div>
    </AuthFormField>
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
      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0a255d] to-[#1e40af] px-6 py-3.5 font-label text-sm font-bold text-white shadow-[0_4px_16px_rgba(10,37,93,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(10,37,93,0.4)] disabled:translate-y-0 disabled:opacity-60"
    >
      {loading ? (
        <>
          <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
          {loadingLabel}
        </>
      ) : (
        <>
          {label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}

export function AuthAltActions({
  primary,
  secondary,
}: {
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
}) {
  return (
    <div className="mt-8 rounded-2xl border border-border/60 bg-bg-soft/60 p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AuthAltButton href={primary.href} label={primary.label} />
        <AuthAltButton href={secondary.href} label={secondary.label} icon="store" />
      </div>
    </div>
  );
}

function AuthAltButton({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: "store";
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-white px-3 py-3 text-center text-[13px] font-semibold text-primary shadow-[0_1px_2px_rgba(17,24,39,0.04)] transition-all hover:border-[#0a255d]/30 hover:text-[#0a255d] hover:shadow-[0_4px_12px_rgba(10,37,93,0.08)]"
    >
      {icon === "store" ? <Store className="h-3.5 w-3.5 shrink-0 opacity-60" /> : null}
      {label}
    </Link>
  );
}

export function AuthGoToStoreLink() {
  return (
    <Link
      href="/"
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-white px-4 py-3 text-sm font-semibold text-primary shadow-[0_1px_2px_rgba(17,24,39,0.04)] transition-all hover:border-[#0a255d]/30 hover:text-[#0a255d]"
    >
      <Store className="h-4 w-4 opacity-60" />
      Go to Store
    </Link>
  );
}

export function AuthSuccessState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="py-6 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/80">
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
          <polyline points="20,6 9,17 4,12" />
        </svg>
      </div>
      <h2 className="font-display text-xl font-bold text-primary">{title}</h2>
      <p className="mt-2 text-sm text-muted">{message}</p>
    </div>
  );
}
