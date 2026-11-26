"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import OtpVerifyCard from "@/components/auth/OtpVerifyCard";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api/auth.api";
import { getAuthErrorMessage } from "@/lib/api/auth-errors";
import { OTP_RESEND_SECONDS } from "@/lib/phone-otp";
import type { StoreUser } from "@/lib/types";
import * as Icons from "@/components/Icons";

const inputClass =
  "w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-all placeholder:text-gray-400 focus:border-[#0a255d] focus:shadow-[0_0_0_4px_rgba(10,37,93,0.12)]";

const primaryBtnClass =
  "group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#061a3d] via-[#0a255d] to-[#1d4ed8] px-5 py-3.5 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(10,37,93,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(10,37,93,0.55)] disabled:translate-y-0 disabled:opacity-70";

type Step = "email" | "code";

function readableEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  if (!email || email.length > 254 || email.endsWith(".phone.local")) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export default function EmailOtpForm({
  onSignedIn,
  onChangeMethod,
}: {
  onSignedIn: (user: StoreUser) => void;
  onChangeMethod: () => void;
}) {
  const { confirmEmailOtp, loading, setError, clearError } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const signedInUser = useRef<StoreUser | null>(null);
  const [resendIn, setResendIn] = useState(0);

  const resendCooling = resendIn > 0;

  useEffect(() => {
    if (!resendCooling) return;
    const timer = window.setInterval(() => {
      setResendIn((seconds) => (seconds <= 1 ? 0 : seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooling]);

  const sendCode = async () => {
    if (sending) return;
    clearError();
    const nextEmail = readableEmail(email);
    if (!nextEmail) {
      setEmailError("Enter a valid email address");
      return;
    }

    setEmailError(null);
    setSending(true);
    try {
      const res = await authApi.sendEmailOtp({ email: nextEmail });
      const id = res.data?.challengeId?.trim();
      if (!id) throw new Error("Verification did not start. Please try again.");
      setEmail(nextEmail);
      setChallengeId(id);
      setStep("code");
      setResendIn(OTP_RESEND_SECONDS);
    } catch (error) {
      setError(getAuthErrorMessage(error, "emailLogin"));
    } finally {
      setSending(false);
    }
  };

  const resendCode = async () => {
    if (!challengeId || resendIn > 0 || sending || loading) return;
    clearError();
    setSending(true);
    try {
      const res = await authApi.resendEmailOtp({ challengeId });
      const id = res.data?.challengeId?.trim() || challengeId;
      setChallengeId(id);
      setResendIn(OTP_RESEND_SECONDS);
    } catch (error) {
      setError(getAuthErrorMessage(error, "emailLogin"));
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async (otp: string) => {
    if (!challengeId) {
      setStep("email");
      return false;
    }
    clearError();
    try {
      const result = await confirmEmailOtp(challengeId, otp);
      signedInUser.current = result.storeUser;
      return true;
    } catch (error) {
      clearError();
      throw new Error(getAuthErrorMessage(error, "emailLogin"));
    }
  };

  const changeEmail = () => {
    clearError();
    setStep("email");
    setChallengeId(null);
    signedInUser.current = null;
    setEmailError(null);
    setResendIn(0);
  };

  if (step === "code") {
    return (
      <div className="flex flex-col gap-3.5">
        <OtpVerifyCard
          length={6}
          theme="light"
          channel="email"
          sentTo={email}
          onVerify={verifyCode}
          onSuccess={() => {
            if (signedInUser.current) onSignedIn(signedInUser.current);
          }}
          onResend={() => void resendCode()}
          resendDisabled={sending || loading || resendIn > 0}
          resendLabel={sending ? "Sending…" : resendIn > 0 ? `Resend in ${resendIn}s` : "Resend"}
        />
        <button
          type="button"
          disabled={sending || loading}
          onClick={changeEmail}
          className="text-sm font-bold text-[#0a255d] hover:underline disabled:opacity-60"
        >
          Change email
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-3.5"
      onSubmit={(event) => {
        event.preventDefault();
        void sendCode();
      }}
    >
      <p className="text-sm font-medium text-gray-600">
        We&apos;ll email a one-time code. A new address gets an account automatically.
      </p>
      <label className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wider text-gray-600 md:text-[11px]">
        <span className="flex text-[#0a255d]">
          <Icons.Mail />
        </span>
        Email address
      </label>
      <input
        type="email"
        autoComplete="email"
        value={email}
        placeholder="you@company.com"
        aria-invalid={emailError ? true : undefined}
        onChange={(event) => {
          setEmail(event.target.value);
          setEmailError(null);
          clearError();
        }}
        className={`${inputClass} ${emailError ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]" : ""}`}
      />
      {emailError ? <p className="text-xs font-medium text-red-600">{emailError}</p> : null}
      <button type="submit" disabled={sending} className={primaryBtnClass}>
        {sending ? (
          <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <>
            Send code
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
      <button
        type="button"
        disabled={sending}
        onClick={onChangeMethod}
        className="text-sm font-bold text-[#0a255d] hover:underline disabled:opacity-60"
      >
        Choose another method
      </button>
    </form>
  );
}
