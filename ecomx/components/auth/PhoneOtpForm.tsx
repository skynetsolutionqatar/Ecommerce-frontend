"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAuthErrorMessage } from "@/lib/api/auth-errors";
import {
  isMsg91CaptchaRequired,
  isMsg91CaptchaVerified,
  isMsg91WidgetConfigured,
  MSG91_CAPTCHA_ELEMENT_ID,
  prepareMsg91Widget,
} from "@/lib/msg91-widget.client";
import { resendLoginOtp, sendLoginOtp, type OtpChallenge } from "@/lib/msg91-otp";
import {
  applyPastedOtpPhone,
  defaultOtpCountry,
  formatOtpIdentifier,
  OTP_COUNTRIES,
  OTP_RESEND_SECONDS,
  otpIdentifier,
  otpPhoneError,
  sanitizeOtpNational,
  type OtpPhoneCountry,
} from "@/lib/phone-otp";
import type { StoreUser } from "@/lib/types";
import * as Icons from "@/components/Icons";
import { ArrowRight } from "lucide-react";

const inputClass =
  "w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-all placeholder:text-gray-400 focus:border-[#0a255d] focus:shadow-[0_0_0_4px_rgba(10,37,93,0.12)]";

const primaryBtnClass =
  "group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#061a3d] via-[#0a255d] to-[#1d4ed8] px-5 py-3.5 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(10,37,93,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(10,37,93,0.55)] disabled:translate-y-0 disabled:opacity-70";

const outlineBtnClass =
  "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition-all hover:border-[#0a255d]/40 hover:bg-gray-50 hover:text-[#0a255d] disabled:opacity-60";

type Step = "phone" | "code";

export default function PhoneOtpForm({
  onSignedIn,
}: {
  onSignedIn: (user: StoreUser) => void;
}) {
  const { confirmPhoneOtp, loading, setError, clearError } = useAuth();
  const widgetOn = isMsg91WidgetConfigured();
  const [country, setCountry] = useState<OtpPhoneCountry>(defaultOtpCountry);
  const [national, setNational] = useState("");
  const [step, setStep] = useState<Step>("phone");
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  const [code, setCode] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [widgetNotice, setWidgetNotice] = useState<string | null>(null);
  const [widgetPhase, setWidgetPhase] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [captchaSolved, setCaptchaSolved] = useState(false);

  const dial = OTP_COUNTRIES[country];
  const sentTo = challenge ? formatOtpIdentifier(
    otpIdentifier(national, country) ?? `${dial.dial}${national}`
  ) : "";

  useEffect(() => {
    if (!widgetOn || step !== "phone") return;
    let cancelled = false;
    // Wait one tick so Strict Mode's simulated unmount cancels this before init,
    // and the captcha element from this commit is the one the SDK binds to.
    const timer = window.setTimeout(() => {
      if (cancelled || !document.getElementById(MSG91_CAPTCHA_ELEMENT_ID)) return;
      setWidgetPhase("loading");
      setCaptchaSolved(false);
      void prepareMsg91Widget()
        .then(() => {
          if (cancelled) return;
          setWidgetNotice(null);
          setWidgetPhase("ready");
          setCaptchaSolved(!isMsg91CaptchaRequired() || isMsg91CaptchaVerified());
        })
        .catch((error) => {
          if (cancelled) return;
          setWidgetNotice(getAuthErrorMessage(error, "phoneLogin"));
          setWidgetPhase("error");
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [widgetOn, step]);

  useEffect(() => {
    if (!widgetOn || widgetPhase !== "ready" || !isMsg91CaptchaRequired()) return;
    const timer = window.setInterval(() => {
      const solved = isMsg91CaptchaVerified();
      setCaptchaSolved((current) => (current === solved ? current : solved));
    }, 400);
    return () => window.clearInterval(timer);
  }, [widgetOn, widgetPhase]);

  const resendCooling = resendIn > 0;

  useEffect(() => {
    if (!resendCooling) return;
    const timer = window.setInterval(() => {
      setResendIn((seconds) => (seconds <= 1 ? 0 : seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooling]);

  const startCooldown = () => setResendIn(OTP_RESEND_SECONDS);

  const sendCode = async () => {
    if (sending) return;
    if (widgetOn && widgetPhase !== "ready") return;
    if (widgetOn && isMsg91CaptchaRequired() && !isMsg91CaptchaVerified()) {
      setWidgetNotice("Complete the verification check, then request the code again.");
      return;
    }
    clearError();
    const identifier = otpIdentifier(national, country);
    if (!identifier) {
      setPhoneError(otpPhoneError(country));
      return;
    }

    setPhoneError(null);
    setSending(true);
    try {
      const next = await sendLoginOtp(identifier);
      setChallenge(next);
      setCode("");
      setStep("code");
      startCooldown();
    } catch (error) {
      setError(getAuthErrorMessage(error, "phoneLogin"));
    } finally {
      setSending(false);
    }
  };

  const resendCode = async () => {
    if (!challenge || resendIn > 0 || sending || loading) return;
    clearError();
    setSending(true);
    try {
      const next = await resendLoginOtp(challenge);
      setChallenge(next);
      setCode("");
      startCooldown();
    } catch (error) {
      setError(getAuthErrorMessage(error, "phoneLogin"));
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    const otp = code.replace(/\D/g, "").slice(0, 6);
    if (!challenge) {
      setStep("phone");
      return;
    }
    if (otp.length !== 6) {
      setError("Enter the 6-digit verification code");
      return;
    }

    clearError();
    try {
      const result = await confirmPhoneOtp(challenge.reqId, otp);
      onSignedIn(result.storeUser);
    } catch {
      // useAuth stores the message for AuthFormError
    }
  };

  const changeNumber = () => {
    clearError();
    setStep("phone");
    setChallenge(null);
    setCode("");
    setPhoneError(null);
    setResendIn(0);
    if (widgetOn) {
      setWidgetPhase("idle");
      setCaptchaSolved(false);
    }
  };

  if (step === "code") {
    return (
      <form
        className="flex flex-col gap-3.5"
        onSubmit={(event) => {
          event.preventDefault();
          void verifyCode();
        }}
      >
        <p className="text-sm font-medium text-gray-600">
          Enter the 6-digit code sent to{" "}
          <span className="font-bold text-gray-900">{sentTo}</span>.
        </p>
        <label className="mb-0 flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wider text-gray-600 md:text-[11px]">
          <span className="flex text-[#0a255d]">
            <Icons.Phone />
          </span>
          Verification code
        </label>
        <input
          value={code}
          onChange={(event) => {
            clearError();
            setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          className={`${inputClass} text-center text-lg tracking-[0.4em]`}
          aria-label="6-digit verification code"
        />
        <button type="submit" disabled={loading || sending || code.length !== 6} className={primaryBtnClass}>
          {loading ? (
            <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              Verify and sign in
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
        <button
          type="button"
          disabled={sending || loading || resendIn > 0}
          onClick={() => void resendCode()}
          className={outlineBtnClass}
        >
          {sending ? "Sending…" : resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
        </button>
        <button
          type="button"
          disabled={sending || loading}
          onClick={changeNumber}
          className="text-sm font-bold text-[#0a255d] hover:underline disabled:opacity-60"
        >
          Change number
        </button>
      </form>
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
        We&apos;ll text a one-time code. A new number gets an account automatically.
      </p>
      <label className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wider text-gray-600 md:text-[11px]">
        <span className="flex text-[#0a255d]">
          <Icons.Phone />
        </span>
        Mobile number
      </label>
      <div
        className={`flex overflow-hidden rounded-xl border-2 bg-white ${
          phoneError ? "border-red-400" : "border-gray-200 focus-within:border-[#0a255d]"
        }`}
      >
        <label className="sr-only" htmlFor="otp-country">
          Country
        </label>
        <select
          id="otp-country"
          value={country}
          onChange={(event) => {
            const next = event.target.value === "IN" ? "IN" : "QA";
            setCountry(next);
            setNational((current) => sanitizeOtpNational(current, next));
            setPhoneError(null);
            clearError();
          }}
          className="max-w-[46%] shrink-0 border-0 border-r border-gray-200 bg-gray-50 px-2 text-sm font-semibold text-gray-800 outline-none sm:px-3"
        >
          {(Object.keys(OTP_COUNTRIES) as OtpPhoneCountry[]).map((code) => (
            <option key={code} value={code}>
              {OTP_COUNTRIES[code].label} +{OTP_COUNTRIES[code].dial}
            </option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={national}
          placeholder={dial.placeholder}
          aria-invalid={phoneError ? true : undefined}
          onChange={(event) => {
            const next = applyPastedOtpPhone(event.target.value, country);
            setCountry(next.country);
            setNational(next.national);
            setPhoneError(null);
            clearError();
          }}
          className="min-w-0 flex-1 border-0 bg-white px-3 py-3.5 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>
      {phoneError ? <p className="text-xs font-medium text-red-600">{phoneError}</p> : null}
      {widgetOn ? (
        <div id={MSG91_CAPTCHA_ELEMENT_ID} className="min-h-[78px]" />
      ) : null}
      {widgetNotice ? <p className="text-xs font-medium text-amber-700">{widgetNotice}</p> : null}
      {widgetOn && widgetPhase === "ready" && isMsg91CaptchaRequired() && !captchaSolved ? (
        <p className="text-xs font-medium text-gray-500">
          Complete the verification check to send a code.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={
          sending ||
          (widgetOn && widgetPhase !== "ready") ||
          (widgetOn && isMsg91CaptchaRequired() && !captchaSolved)
        }
        className={primaryBtnClass}
      >
        {sending ? (
          <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : widgetOn && widgetPhase === "loading" ? (
          "Preparing verification…"
        ) : (
          <>
            Send code
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
