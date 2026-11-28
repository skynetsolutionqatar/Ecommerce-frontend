import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  COOKIE_CONSENT_COOKIE_NAME,
  COOKIE_CONSENT_STORAGE_KEY,
  acceptAllCookies,
  allowsCookieCategory,
  getCookieConsentSnapshot,
  readCookieConsent,
  rejectOptionalCookies,
  shouldShowCookieConsentBanner,
} from "@/lib/store/cookie-consent";

function makeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

function makeCookieStorage() {
  const jar = new Map<string, string>();
  return {
    get cookie() {
      return Array.from(jar.entries())
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");
    },
    set cookie(value: string) {
      const pair = value.split(";")[0] ?? "";
      const eq = pair.indexOf("=");
      if (eq < 0) return;
      const name = pair.slice(0, eq).trim();
      const raw = pair.slice(eq + 1);
      jar.set(name, decodeURIComponent(raw.trim()));
    },
    jar,
  };
}

describe("cookie consent", () => {
  beforeEach(() => {
    const cookieDoc = makeCookieStorage();
    vi.stubGlobal("window", { localStorage: makeStorage(), location: { protocol: "https:" } });
    vi.stubGlobal("document", cookieDoc);
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    cookieDoc.jar.clear();
  });

  it("shows banner while consent state is pending or unanswered", () => {
    expect(getCookieConsentSnapshot()).toBe("pending");
    expect(shouldShowCookieConsentBanner("pending")).toBe(true);
    expect(shouldShowCookieConsentBanner(null)).toBe(true);
  });

  it("persists accept and reject choices", () => {
    acceptAllCookies();
    expect(allowsCookieCategory("performance")).toBe(true);
    const snapshot = getCookieConsentSnapshot();
    expect(snapshot !== "pending" && snapshot?.decision).toBe("accepted");
    expect(document.cookie).toContain(`${COOKIE_CONSENT_COOKIE_NAME}=`);
    rejectOptionalCookies();
    expect(allowsCookieCategory("performance")).toBe(false);
    expect(readCookieConsent()?.decision).toBe("rejected");
  });

  it("reads consent from cookie when localStorage is empty", () => {
    acceptAllCookies();
    const saved = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    expect(readCookieConsent()?.decision).toBe("accepted");
    expect(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toBe(saved);
  });
});