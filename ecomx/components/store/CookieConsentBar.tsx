"use client";

import Link from "next/link";
import { Cookie } from "lucide-react";
import { ROUTES } from "@/lib/routes";

const outlineBtn =
  "inline-flex h-10 items-center justify-center rounded-lg border border-white/35 bg-white/10 px-4 text-xs font-extrabold uppercase tracking-wide text-white transition hover:border-white/55 hover:bg-white/15 sm:min-w-[108px]";
const primaryBtn =
  "inline-flex h-10 items-center justify-center rounded-lg border-0 bg-white px-4 text-xs font-extrabold uppercase tracking-wide text-[#0a255d] shadow-sm transition hover:bg-slate-100 sm:min-w-[108px]";

export default function CookieConsentBar({
  onAccept,
  onReject,
  onCustomize,
  onLearnMore,
}: {
  onAccept: () => void;
  onReject: () => void;
  onCustomize: () => void;
  onLearnMore?: () => void;
}) {
  return (
    <section
      role="region"
      aria-label="Cookie consent"
      className="cookie-consent-bar pointer-events-auto fixed inset-x-0 bottom-0 z-[220] flex justify-center px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 md:px-4 md:pb-4"
    >
      <div className="flex w-full max-w-5xl flex-col gap-3 rounded-2xl border border-[#0c3070] bg-[#0a255d] p-4 shadow-[0_12px_40px_rgba(10,37,93,0.45)] sm:flex-row sm:items-center sm:gap-4 sm:p-5">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-900 ring-1 ring-amber-200/80"
            aria-hidden
          >
            <Cookie className="h-5 w-5 shrink-0 text-amber-900" strokeWidth={2.25} aria-hidden />
          </span>
          <p className="text-sm leading-5 text-white/90">
            We use cookies to improve your experience on our website.{" "}
            <Link
              href={ROUTES.cookiePolicy}
              className="font-semibold text-white underline decoration-white/50 underline-offset-2 hover:decoration-white"
              onClick={() => onLearnMore?.()}
            >
              Learn More
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:shrink-0 sm:justify-end">
          <button type="button" onClick={onReject} className={outlineBtn}>
            Reject
          </button>
          <button type="button" onClick={onCustomize} className={outlineBtn}>
            Customize
          </button>
          <button type="button" onClick={onAccept} className={primaryBtn}>
            Accept all
          </button>
        </div>
      </div>
    </section>
  );
}