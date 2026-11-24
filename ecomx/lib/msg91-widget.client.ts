import { API_CONFIG } from "@/lib/config";

const SCRIPT_SRC = "https://verify.msg91.com/otp-provider.js";
export const MSG91_CAPTCHA_ELEMENT_ID = "skynet-msg91-captcha";

type Msg91Callback = (payload: unknown) => void;

type Msg91Config = {
  widgetId: string;
  tokenAuth: string;
  exposeMethods: true;
  captchaRenderId: string;
  success: Msg91Callback;
  failure: Msg91Callback;
};

type Msg91WidgetData = {
  captchaValidations?: boolean | number | string | null;
};

declare global {
  interface Window {
    initSendOTP?: (config: Msg91Config) => void;
    sendOtp?: (identifier: string, success?: Msg91Callback, failure?: Msg91Callback) => void;
    retryOtp?: (
      channel: string | null,
      success?: Msg91Callback,
      failure?: Msg91Callback,
      reqId?: string
    ) => void;
    isCaptchaVerified?: () => boolean;
    getWidgetData?: () => Msg91WidgetData | null;
  }
}

const INIT_TIMEOUT_MS = 15_000;

let scriptPromise: Promise<void> | null = null;
let initPromise: Promise<void> | null = null;
let boundCaptcha: HTMLElement | null = null;
let captchaRequired = false;
let widgetReady = false;
let onFailureRef: Msg91Callback = () => undefined;

export function isMsg91WidgetConfigured(): boolean {
  return Boolean(API_CONFIG.msg91WidgetId && API_CONFIG.msg91Token);
}

export function isMsg91CaptchaRequired(): boolean {
  return captchaRequired;
}

export function isMsg91CaptchaVerified(): boolean {
  return typeof window !== "undefined" && window.isCaptchaVerified?.() === true;
}

function captchaHost(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const element = document.getElementById(MSG91_CAPTCHA_ELEMENT_ID);
  return element?.isConnected ? element : null;
}

export function friendlyMsg91Message(message: string): string {
  if (/failed to load hcaptcha/i.test(message)) {
    return "Verification could not be loaded. Check your connection and try again.";
  }
  if (/invalid captcha/i.test(message)) {
    return "Complete the verification check, then request the code again.";
  }
  if (/expired/i.test(message)) {
    return "That code is incorrect or has expired. Request a new one.";
  }
  if (/network|failed to fetch/i.test(message)) {
    return "Network error. Check your connection and try again.";
  }
  return message;
}

export function readMsg91ReqId(payload: unknown): string | null {
  if (typeof payload === "string") {
    const value = payload.trim();
    return value && !/\s/.test(value) ? value : null;
  }
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  for (const key of ["reqId", "requestId", "message"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim() && !/\s/.test(value.trim())) {
      return value.trim();
    }
  }
  return null;
}

export function readMsg91Error(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim()) return payload.trim();
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string" && record.message.trim()) return record.message.trim();
    if (typeof record.error === "string" && record.error.trim()) return record.error.trim();
  }
  return fallback;
}

function loadWidgetScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Phone verification is only available in the browser."));
  }
  if (typeof window.initSendOTP === "function") return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const fail = () => {
      scriptPromise = null;
      reject(new Error("Could not load phone verification. Check your connection and try again."));
    };
    const succeed = () => {
      if (typeof window.initSendOTP === "function") {
        resolve();
        return;
      }
      fail();
    };

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      if (typeof window.initSendOTP === "function") {
        resolve();
        return;
      }
      existing.addEventListener("load", succeed, { once: true });
      existing.addEventListener("error", fail, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = succeed;
    script.onerror = fail;
    document.head.appendChild(script);
  });

  return scriptPromise;
}

function captchaIsRequired(data: Msg91WidgetData): boolean {
  const value = data.captchaValidations;
  return value === true || value === 1 || value === "1" || value === "true";
}

function captchaHasRendered(host: HTMLElement): boolean {
  return Boolean(host.querySelector("iframe, textarea"));
}

function waitForWidgetReady(host: HTMLElement): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let timer = 0;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearInterval(timer);
      if (error) reject(error);
      else resolve();
    };

    onFailureRef = (payload) => {
      finish(
        new Error(
          friendlyMsg91Message(
            readMsg91Error(payload, "Phone verification failed to start. Refresh the page and try again.")
          )
        )
      );
    };

    const started = Date.now();
    timer = window.setInterval(() => {
      if (!host.isConnected) {
        finish(new Error("Verification could not be shown. Refresh the page and try again."));
        return;
      }
      const data = window.getWidgetData?.();
      if (!data || typeof data !== "object") {
        if (Date.now() - started > INIT_TIMEOUT_MS) {
          finish(new Error("Phone verification failed to start. Refresh the page and try again."));
        }
        return;
      }
      const required = captchaIsRequired(data);
      captchaRequired = required;
      if (!required || captchaHasRendered(host)) {
        finish();
        return;
      }
      if (Date.now() - started > INIT_TIMEOUT_MS) {
        finish(new Error("Verification could not be loaded. Check your connection and try again."));
      }
    }, 100);
  });
}

/**
 * Load the MSG91 script once and bind it to the live captcha element.
 * A second call for the same connected element reuses the in-flight init.
 * React Strict Mode should delay the first call until the mount survives.
 */
export function prepareMsg91Widget(): Promise<void> {
  if (!isMsg91WidgetConfigured()) {
    return Promise.reject(new Error("Phone verification is not configured."));
  }

  const host = captchaHost();
  if (!host) {
    return Promise.reject(
      new Error("Verification could not be shown. Refresh the page and try again.")
    );
  }
  if (widgetReady && boundCaptcha === host) return Promise.resolve();
  if (initPromise && boundCaptcha === host) return initPromise;

  boundCaptcha = host;
  widgetReady = false;
  captchaRequired = false;

  const pending = (async () => {
    await loadWidgetScript();
    if (!host.isConnected || typeof window.initSendOTP !== "function") {
      throw new Error("Phone verification failed to start. Refresh the page and try again.");
    }

    const ready = waitForWidgetReady(host);
    window.initSendOTP({
      widgetId: API_CONFIG.msg91WidgetId,
      tokenAuth: API_CONFIG.msg91Token,
      exposeMethods: true,
      captchaRenderId: MSG91_CAPTCHA_ELEMENT_ID,
      // Method callbacks receive send and verify results. This pair only reports startup failure.
      success: () => undefined,
      failure: (payload) => onFailureRef(payload),
    });
    await ready;
    widgetReady = true;
  })().catch((error: unknown) => {
    if (initPromise === pending) {
      initPromise = null;
      widgetReady = false;
      boundCaptcha = null;
    }
    throw error instanceof Error
      ? error
      : new Error("Phone verification failed to start. Refresh the page and try again.");
  });

  initPromise = pending;
  return pending;
}

function callWidget<T>(
  invoke: (ok: Msg91Callback, fail: Msg91Callback) => void,
  mapSuccess: (payload: unknown) => T,
  fallback: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error("Phone verification timed out. Please try again."));
    }, 45_000);

    const finish = (fn: () => void) => {
      window.clearTimeout(timer);
      fn();
    };

    try {
      invoke(
        (payload) => {
          finish(() => {
            try {
              resolve(mapSuccess(payload));
            } catch (error) {
              reject(error instanceof Error ? error : new Error(fallback));
            }
          });
        },
        (payload) => {
          finish(() =>
            reject(new Error(friendlyMsg91Message(readMsg91Error(payload, fallback))))
          );
        }
      );
    } catch (error) {
      finish(() =>
        reject(error instanceof Error ? error : new Error(fallback))
      );
    }
  });
}

export function widgetSendOtp(identifier: string): Promise<string> {
  if (typeof window.sendOtp !== "function") {
    return Promise.reject(new Error("Phone verification is not ready. Please try again."));
  }
  if (captchaRequired && !isMsg91CaptchaVerified()) {
    return Promise.reject(
      new Error("Complete the verification check, then request the code again.")
    );
  }
  return callWidget(
    (ok, fail) => window.sendOtp?.(identifier, ok, fail),
    (payload) => {
      const reqId = readMsg91ReqId(payload);
      if (!reqId) throw new Error("Verification did not start. Please try again.");
      return reqId;
    },
    "Could not send the verification code. Try again."
  );
}

export function widgetRetryOtp(reqId: string): Promise<string> {
  if (typeof window.retryOtp !== "function") {
    return Promise.reject(new Error("Could not resend the code. Please try again."));
  }
  return callWidget(
    (ok, fail) => window.retryOtp?.(null, ok, fail, reqId),
    (payload) => readMsg91ReqId(payload) ?? reqId,
    "Could not resend the code. Please try again."
  );
}
