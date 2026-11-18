"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginModal from "@/components/LoginModal";

const APP_SCHEME = "skynetstore";

function isMobileUserAgent(ua: string): boolean {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}

/**
 * Website reset page (fallback when the native app is not installed).
 * On phones, try the custom scheme first so an installed EAS build opens
 * the native reset screen — Universal / App Links still preferred when verified.
 */
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [showWebForm, setShowWebForm] = useState(false);

  const appHref = useMemo(() => {
    if (!token.trim()) return null;
    return `${APP_SCHEME}://reset-password?token=${encodeURIComponent(token.trim())}`;
  }, [token]);

  useEffect(() => {
    if (!token.trim()) {
      setShowWebForm(true);
      return;
    }

    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    if (!isMobileUserAgent(ua) || !appHref) {
      setShowWebForm(true);
      return;
    }

    // Attempt to hand off to the installed app without losing the web fallback.
    const started = Date.now();
    const blurHandler = () => {
      // App likely took focus — keep web form hidden briefly.
    };
    window.addEventListener("blur", blurHandler);

    // Hidden iframe + location attempt covers more Android / iOS mail clients.
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = appHref;
    document.body.appendChild(iframe);

    const t = window.setTimeout(() => {
      // If the page is still visible, show the existing website reset UI.
      if (document.visibilityState === "visible" && Date.now() - started >= 900) {
        setShowWebForm(true);
      } else {
        setShowWebForm(true);
      }
      iframe.remove();
      window.removeEventListener("blur", blurHandler);
    }, 1200);

    try {
      window.location.href = appHref;
    } catch {
      setShowWebForm(true);
    }

    return () => {
      window.clearTimeout(t);
      iframe.remove();
      window.removeEventListener("blur", blurHandler);
    };
  }, [appHref, token]);

  if (!showWebForm) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-bg px-6 py-16 text-center">
        <p className="font-display text-lg font-bold text-primary">Opening SKYNET Store…</p>
        <p className="max-w-md text-sm text-muted">
          If the app does not open, you can continue resetting your password on the website.
        </p>
        {appHref ? (
          <a href={appHref} className="text-sm font-bold text-accent underline underline-offset-4">
            Open in SKYNET Store app
          </a>
        ) : null}
        <button
          type="button"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
          onClick={() => setShowWebForm(true)}
        >
          Continue on website
        </button>
      </main>
    );
  }

  return (
    <LoginModal
      open
      initialMode="reset"
      resetToken={token}
      onClose={() => router.replace("/")}
    />
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
