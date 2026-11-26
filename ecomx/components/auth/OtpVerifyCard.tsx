"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

/**
 * Six-digit OTP card — same motion system as the supplied reference:
 * type → orbiting ring → merge + check + green tint, or shake + reset.
 * Verification always goes through onVerify (no demo code).
 */

const REF_SIZE = 44;
const REF_GAP = 8;
const REF_MERGE_STEP = 8;
const REF_MERGE_OFFSET = 12;
const ORANGE = "#ec6a1c";
const GREEN = "#78d13b";
const RED = "#ff5a52";

const PALETTE = {
  dark: {
    cardFrom: "#242324",
    cardTo: "#171617",
    cardBorder: "rgba(255,255,255,0.09)",
    shadow: "0 24px 60px rgba(0,0,0,0.55)",
    title: "#ffffff",
    sub: "#8b8a8c",
    cell: "#2f2e2f",
    cellBorder: "rgba(255,255,255,0.14)",
    cellDone: "#262624",
    digit: "#ffffff",
    resend: "#ffffff",
    check: "#ffffff",
    okBg: "radial-gradient(120% 120% at 15% 85%, #2b3b12 0%, #1d2810 55%, #141b0b 100%)",
    errBg: "radial-gradient(120% 120% at 50% 100%, #3a1717 0%, #251111 60%, #170c0c 100%)",
    errText: "#c97a76",
  },
  light: {
    cardFrom: "#ffffff",
    cardTo: "#f2f2f4",
    cardBorder: "rgba(0,0,0,0.08)",
    shadow: "0 24px 60px rgba(20,20,30,0.12)",
    title: "#111111",
    sub: "#8a8a90",
    cell: "#ececef",
    cellBorder: "rgba(0,0,0,0.12)",
    cellDone: "#ffffff",
    digit: "#111111",
    resend: "#111111",
    check: "#1a1a1a",
    okBg: "radial-gradient(120% 120% at 15% 85%, #e4f5d2 0%, #d6efbd 60%, #cbe8b0 100%)",
    errBg: "radial-gradient(120% 120% at 50% 100%, #fde3e1 0%, #fbd3d0 100%)",
    errText: "#c0453e",
  },
} as const;

type ThemeMode = keyof typeof PALETTE;
type Status = "idle" | "verifying" | "merging" | "success" | "error";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function otpRowLayout(length: number, innerWidth: number) {
  const rowNeed = length * REF_SIZE + (length - 1) * REF_GAP;
  const scale = Math.min(1, Math.max(0.72, innerWidth / rowNeed));
  const size = REF_SIZE * scale;
  const gap = REF_GAP * scale;
  const pitch = size + gap;
  const mergeStep = REF_MERGE_STEP * scale;
  const mergeOffset = REF_MERGE_OFFSET * scale;
  return {
    size,
    gap,
    pitch,
    mergeStep,
    mergeOffset,
    fontSize: Math.max(15, 18 * scale),
    checkSize: Math.max(18, 22 * scale),
  };
}

export default function OtpVerifyCard({
  length = 6,
  theme = "light",
  onVerify,
  onSuccess,
  onError,
  onResend,
  resendLabel = "Resend",
  resendDisabled = false,
  minLoadingMs = 1800,
  channel = "phone",
  sentTo,
}: {
  length?: number;
  theme?: "dark" | "light" | "system";
  onVerify: (code: string) => boolean | Promise<boolean>;
  onSuccess?: (code: string) => void;
  onError?: (code: string) => void;
  onResend?: () => void;
  resendLabel?: string;
  resendDisabled?: boolean;
  minLoadingMs?: number;
  channel?: "phone" | "email" | "whatsapp";
  sentTo?: string;
}) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [sysDark, setSysDark] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [rowInnerWidth, setRowInnerWidth] = useState(280);
  const inputRef = useRef<HTMLInputElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = (event: MediaQueryListEvent) => setSysDark(event.matches);
    mq.addEventListener("change", onScheme);

    const row = rowRef.current;
    const updateWidth = () => {
      if (!row) return;
      const next = Math.max(160, row.clientWidth);
      setRowInnerWidth((prev) => (prev === next ? prev : next));
    };
    const observer = row ? new ResizeObserver(updateWidth) : null;
    if (row && observer) {
      updateWidth();
      observer.observe(row);
    }

    return () => {
      alive.current = false;
      mq.removeEventListener("change", onScheme);
      observer?.disconnect();
      timers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const mode: ThemeMode = theme === "system" ? (sysDark ? "dark" : "light") : theme;
  const palette = PALETTE[mode];
  const { size, gap, pitch, mergeStep, mergeOffset, fontSize, checkSize } = otpRowLayout(
    length,
    rowInnerWidth
  );

  const run = async (value: string) => {
    setStatus("verifying");
    setErrorText(null);
    let ok = false;
    try {
      const [result] = await Promise.all([
        Promise.resolve(onVerify(value)).then((res) => !!res),
        wait(minLoadingMs),
      ]);
      ok = !!result;
    } catch (error) {
      ok = false;
      setErrorText(error instanceof Error && error.message.trim() ? error.message.trim() : null);
    }
    if (!alive.current) return;
    if (ok) {
      setStatus("merging");
      later(() => {
        setStatus("success");
        onSuccess?.(value);
      }, 900);
    } else {
      setStatus("error");
      onError?.(value);
      later(() => {
        setCode("");
        setErrorText(null);
        setStatus("idle");
        inputRef.current?.focus();
      }, 1600);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (status !== "idle") return;
    const next = event.target.value.replace(/\D/g, "").slice(0, length);
    setCode(next);
    if (next.length === length) void run(next);
  };

  const handleResend = () => {
    if (resendDisabled || status === "verifying" || status === "merging" || status === "success") return;
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setCode("");
    setErrorText(null);
    setStatus("idle");
    onResend?.();
    inputRef.current?.focus();
  };

  const merging = status === "merging" || status === "success";
  const done = status === "success";
  const verifying = status === "verifying";
  const error = status === "error";
  const mid = (length - 1) / 2;
  const subject =
    channel === "email" ? "email" : channel === "whatsapp" ? "WhatsApp number" : "number";

  const title = done ? "Verified successfully" : error ? "Incorrect code" : `Verify your ${subject}`;
  const sentLine = sentTo ? ` to ${sentTo}` : "";
  const sub = done
    ? `Your ${subject} has been verified`
    : error
      ? errorText || "That code didn't match. Check it and try again."
      : `Enter the ${length} digit verification code that we've just sent${sentLine}`;

  const cells = Array.from({ length }, (_, index) => {
    const digit = code[index] || "";
    const isFocus = status === "idle" && focused && index === code.length;
    let tx = 0;
    let opacity = 1;
    let border: string = palette.cellBorder;
    if (isFocus) border = ORANGE;
    if (verifying) border = "rgba(236,106,28,0.35)";
    if (error) border = RED;
    if (merging) {
      border = GREEN;
      const target = done ? 0 : index * mergeStep - mergeOffset;
      tx = target - (index - mid) * pitch;
      if (done && index > 0) opacity = 0;
    }

    return (
      <div
        key={index}
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          boxSizing: "border-box",
          border: `1.5px solid ${border}`,
          background: merging ? palette.cellDone : palette.cell,
          color: palette.digit,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize,
          fontWeight: 500,
          zIndex: length - index,
          opacity,
          flexShrink: 0,
          transform: `translateX(${tx}px) scale(${isFocus ? 1.04 : 1})`,
          boxShadow: verifying ? "0 0 14px rgba(236,106,28,0.28)" : "none",
          transition:
            "transform 650ms cubic-bezier(.65,0,.35,1), opacity 350ms ease, border-color 300ms ease, background 300ms ease, box-shadow 300ms ease",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -1.5,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 190deg, rgba(236,106,28,0.9) 300deg, #ffe6c4 352deg, transparent 360deg)",
            WebkitMaskImage:
              "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px))",
            maskImage:
              "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px))",
            opacity: verifying ? 1 : 0,
            animation: verifying ? `otp-spin 1s linear ${index * -0.18}s infinite` : "none",
            transition: "opacity 250ms ease",
            pointerEvents: "none",
          }}
        />
        <span
          style={{
            opacity: merging ? (index === 0 && !done ? 1 : 0) : 1,
            transition: "opacity 300ms ease",
          }}
        >
          {digit}
        </span>
        {index === 0 ? (
          <svg
            width={checkSize}
            height={checkSize}
            viewBox="0 0 24 24"
            fill="none"
            style={{ position: "absolute" }}
            aria-hidden
          >
            <path
              d="M5 12.5 L10 17.5 L19 7"
              stroke={palette.check}
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={done ? 0 : 1}
              style={{ transition: "stroke-dashoffset 450ms ease 250ms" }}
            />
          </svg>
        ) : null}
      </div>
    );
  });

  return (
    <div
      ref={shellRef}
      onClick={() => inputRef.current?.focus()}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        marginInline: "auto",
        boxSizing: "border-box",
        padding: "36px clamp(12px, 4vw, 24px) 30px",
        borderRadius: 40,
        overflow: "hidden",
        background: `linear-gradient(145deg, ${palette.cardFrom}, ${palette.cardTo})`,
        border: `1px solid ${palette.cardBorder}`,
        boxShadow: palette.shadow,
        fontFamily: "Inter, -apple-system, 'Segoe UI', Roboto, system-ui, sans-serif",
        textAlign: "center",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{`
        @keyframes otp-spin { to { transform: rotate(360deg); } }
        @keyframes otp-shake {
          0%,100% { transform: translateX(0); }
          18% { transform: translateX(-8px); } 36% { transform: translateX(7px); }
          54% { transform: translateX(-5px); } 72% { transform: translateX(3px); }
        }
        @keyframes otp-fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          [data-otp] * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: palette.okBg,
          opacity: merging ? 1 : 0,
          transition: "opacity 600ms ease",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: palette.errBg,
          opacity: error ? 1 : 0,
          transition: "opacity 400ms ease",
          pointerEvents: "none",
        }}
      />

      <div data-otp style={{ position: "relative" }}>
        <h2
          key={title}
          style={{
            margin: 0,
            fontSize: 21,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: palette.title,
            animation: "otp-fade 350ms ease",
          }}
        >
          {title}
        </h2>
        <p
          key={sub}
          style={{
            margin: "10px auto 0",
            maxWidth: 230,
            minHeight: 42,
            fontSize: 14.5,
            lineHeight: "21px",
            color: error ? palette.errText : palette.sub,
            animation: "otp-fade 350ms ease",
            overflowWrap: "anywhere",
          }}
        >
          {sub}
        </p>

        <div
          ref={rowRef}
          style={{
            position: "relative",
            marginTop: 30,
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden",
            height: size,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap,
            animation: error ? "otp-shake 450ms ease" : "none",
          }}
        >
          {cells}
          <input
            ref={inputRef}
            value={code}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            autoFocus
            maxLength={length}
            aria-label={`${length} digit verification code`}
            readOnly={status !== "idle"}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              border: 0,
              padding: 0,
              cursor: "text",
              zIndex: 20,
              caretColor: "transparent",
            }}
          />
        </div>

        <div style={{ marginTop: 36, fontSize: 15, color: palette.sub }}>
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            disabled={resendDisabled || verifying || merging}
            onClick={(event) => {
              event.stopPropagation();
              handleResend();
            }}
            style={{
              all: "unset",
              cursor: resendDisabled || verifying || merging ? "default" : "pointer",
              fontWeight: 600,
              color: palette.resend,
              opacity: resendDisabled ? 0.55 : 1,
            }}
          >
            {resendLabel}
          </button>
        </div>
      </div>
    </div>
  );
}