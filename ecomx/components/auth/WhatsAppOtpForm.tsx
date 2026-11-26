"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import OtpVerifyCard from "@/components/auth/OtpVerifyCard";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api/auth.api";
import { getAuthErrorMessage } from "@/lib/api/auth-errors";
import {
  formatWhatsAppPhone,
  parseQatarWhatsAppPhone,
  sanitizeWhatsAppNational,
  WHATSAPP_LOCAL_LENGTH,
  WHATSAPP_OTP_TTL_MINUTES,
  WHATSAPP_PHONE_ERROR,
  WHATSAPP_RESEND_SECONDS,
} from "@/lib/whatsapp-otp";
import type { StoreUser } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-all placeholder:text-gray-400 focus:border-[#0a255d] focus:shadow-[0_0_0_4px_rgba(10,37,93,0.12)]";

const primaryBtnClass =
  "group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#061a3d] via-[#0a255d] to-[#1d4ed8] px-5 py-3.5 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(10,37,93,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(10,37,93,0.55)] disabled:translate-y-0 disabled:opacity-70";

const labelClass =
  "flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wider text-gray-600 md:text-[11px]";

const spinner = (
  <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
);

type Step = "phone" | "code";

export default function WhatsAppOtpForm({
  onSignedIn,
  onChangeMethod,
}: {
  onSignedIn: (user: StoreUser) => void;
  onChangeMethod: () => void;
}) {
  const { confirmWhatsAppOtp, loading, setError, clearError } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [national, setNational] = useState("");
  const [phone, setPhone] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const signedInUser = useRef<StoreUser | null>(null);

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
    const nextPhone = parseQatarWhatsAppPhone(national);
    if (!nextPhone) {
      setPhoneError(WHATSAPP_PHONE_ERROR);
      return;
    }

    setPhoneError(null);
    setSending(true);
    try {
      const res = await authApi.sendWhatsAppOtp({ phone: nextPhone });
      const id = res.data?.challengeId?.trim();
      if (!id) throw new Error("Verification did not start. Please try again.");
      setPhone(nextPhone);
      setChallengeId(id);
      signedInUser.current = null;
      setStep("code");
      setResendIn(WHATSAPP_RESEND_SECONDS);
    } catch (error) {
      setError(getAuthErrorMessage(error, "whatsappLogin"));
    } finally {
      setSending(false);
    }
  };

  const resendCode = async () => {
    if (!challengeId || resendIn > 0 || sending || loading) return;
    clearError();
    setSending(true);
    try {
      const res = await authApi.resendWhatsAppOtp({ challengeId });
      setChallengeId(res.data?.challengeId?.trim() || challengeId);
      setResendIn(WHATSAPP_RESEND_SECONDS);
    } catch (error) {
      setError(getAuthErrorMessage(error, "whatsappLogin"));
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async (otp: string) => {
    if (!challengeId) {
      setStep("phone");
      return false;
    }
    clearError();
    try {
      const result = await confirmWhatsAppOtp(challengeId, otp);
      signedInUser.current = result.storeUser;
      return true;
    } catch (error) {
      clearError();
      throw new Error(getAuthErrorMessage(error, "whatsappLogin"));
    }
  };

  const changeNumber = () => {
    clearError();
    setStep("phone");
    setChallengeId(null);
    signedInUser.current = null;
    setPhoneError(null);
    setResendIn(0);
  };

  if (step === "code") {
    const sentTo = phone ? formatWhatsAppPhone(phone) : "";
    return (
      <div className="flex flex-col gap-3.5">
        <p className="text-center text-[13px] font-medium text-gray-500">
          Code expires in {WHATSAPP_OTP_TTL_MINUTES} minutes.
        </p>
        <OtpVerifyCard
          length={6}
          theme="light"
          channel="whatsapp"
          sentTo={sentTo}
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
          onClick={changeNumber}
          className="text-sm font-bold text-[#0a255d] hover:underline disabled:opacity-60"
        >
          Change number
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
        Sign in with your Qatar mobile. A new number gets an account automatically.
      </p>
      <label htmlFor="whatsapp-otp-phone" className={labelClass}>
        <MessageCircle className="h-4 w-4 text-[#0a255d]" aria-hidden />
        WhatsApp number
      </label>
      <div
        className={`flex min-w-0 overflow-hidden rounded-xl border-2 bg-white ${
          phoneError ? "border-red-400" : "border-gray-200 focus-within:border-[#0a255d]"
        }`}
      >
        <span className="flex shrink-0 items-center border-r border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700">
          +974
        </span>
        <input
          id="whatsapp-otp-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={WHATSAPP_LOCAL_LENGTH + 6}
          value={national}
          placeholder="55123456"
          aria-invalid={phoneError ? true : undefined}
          aria-describedby="whatsapp-otp-consent"
          onChange={(event) => {
            setNational(sanitizeWhatsAppNational(event.target.value));
            setPhoneError(null);
            clearError();
          }}
          className="w-full min-w-0 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>
      {phoneError ? <p className="text-xs font-medium text-red-600">{phoneError}</p> : null}
      <p id="whatsapp-otp-consent" className="text-xs font-medium text-gray-500">
        We&apos;ll send a one-time code via WhatsApp to this number.
      </p>
      <button type="submit" disabled={sending} className={primaryBtnClass}>
        {sending ? (
          spinner
        ) : (
          <>
            Send code on WhatsApp
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
