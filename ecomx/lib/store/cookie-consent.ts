/** Cookie preference categories — essential is always enabled. */
export type CookieCategory = "performance" | "functional" | "advertising";

export type CookieConsentDecision = "accepted" | "rejected" | "customized";

export type CookieConsentPreferences = {
  performance: boolean;
  functional: boolean;
  advertising: boolean;
};

export type CookieConsentRecord = {
  version: number;
  decision: CookieConsentDecision;
  preferences: CookieConsentPreferences;
  updatedAt: string;
};

export const COOKIE_CONSENT_VERSION = 1;

export const COOKIE_CONSENT_STORAGE_KEY = "@skynet/cookie-consent/v1";

/** First-party cookie mirror — survives some mobile WebViews / storage blocks. */
export const COOKIE_CONSENT_COOKIE_NAME = "skynet_cookie_consent";

export const COOKIE_PREFERENCES_OPEN_EVENT = "skynet:open-cookie-preferences";

export function openCookiePreferences(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COOKIE_PREFERENCES_OPEN_EVENT));
}

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const DEFAULT_REJECTED: CookieConsentPreferences = {
  performance: false,
  functional: false,
  advertising: false,
};

const DEFAULT_ACCEPTED: CookieConsentPreferences = {
  performance: true,
  functional: true,
  advertising: true,
};

const listeners = new Set<() => void>();

/** After first client tick we read storage (avoids hydration mismatch + fixes banner mount). */
let consentClientHydrated = false;

export type CookieConsentSnapshot = CookieConsentRecord | null | "pending";

let snapshotCache: { signature: string; record: CookieConsentSnapshot } | null = null;

function consentSignature(record: CookieConsentSnapshot): string {
  if (record === "pending") return "__pending__";
  if (!record) return "";
  return `${record.version}|${record.decision}|${record.updatedAt}|${record.preferences.performance}|${record.preferences.functional}|${record.preferences.advertising}`;
}

function invalidateSnapshotCache(): void {
  snapshotCache = null;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function readConsentCookieRaw(): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${COOKIE_CONSENT_COOKIE_NAME}=`;
  const segments = document.cookie ? document.cookie.split("; ") : [];
  for (const segment of segments) {
    if (segment.startsWith(prefix)) {
      return decodeURIComponent(segment.slice(prefix.length));
    }
  }
  return null;
}

function writeConsentCookie(serialized: string): void {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${encodeURIComponent(serialized)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function loadConsentRecord(): CookieConsentRecord | null {
  if (typeof window === "undefined") return null;

  try {
    const fromStorage = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (fromStorage) {
      const parsed = parseRecord(JSON.parse(fromStorage));
      if (parsed) return parsed;
    }
  } catch {
    // private mode / quota
  }

  try {
    const fromCookie = readConsentCookieRaw();
    if (fromCookie) {
      const parsed = parseRecord(JSON.parse(fromCookie));
      if (parsed) {
        try {
          window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(parsed));
        } catch {
          // keep cookie-only persistence
        }
        return parsed;
      }
    }
  } catch {
    // ignore malformed cookie
  }

  return null;
}

function persistConsentRecord(record: CookieConsentRecord): void {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(record);
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, serialized);
  } catch {
    // Safari private mode, storage full, etc.
  }
  try {
    writeConsentCookie(serialized);
  } catch {
    // cookie blocked
  }
}

function parseRecord(raw: unknown): CookieConsentRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const entry = raw as Partial<CookieConsentRecord>;
  if (entry.version !== COOKIE_CONSENT_VERSION) return null;
  if (!entry.preferences || typeof entry.preferences !== "object") return null;
  const preferences = entry.preferences as Partial<CookieConsentPreferences>;
  if (
    typeof preferences.performance !== "boolean" ||
    typeof preferences.functional !== "boolean" ||
    typeof preferences.advertising !== "boolean"
  ) {
    return null;
  }
  if (entry.decision !== "accepted" && entry.decision !== "rejected" && entry.decision !== "customized") {
    return null;
  }
  return {
    version: COOKIE_CONSENT_VERSION,
    decision: entry.decision,
    preferences: {
      performance: preferences.performance,
      functional: preferences.functional,
      advertising: preferences.advertising,
    },
    updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : new Date().toISOString(),
  };
}

export function readCookieConsent(): CookieConsentRecord | null {
  return loadConsentRecord();
}

/** Stable snapshot for React useSyncExternalStore (server + pre-hydrate => pending). */
export function getCookieConsentSnapshot(): CookieConsentSnapshot {
  if (typeof window === "undefined" || !consentClientHydrated) {
    return "pending";
  }
  const record = loadConsentRecord();
  const signature = consentSignature(record);
  if (snapshotCache?.signature === signature) {
    return snapshotCache.record;
  }
  snapshotCache = { signature, record };
  return record;
}

export function getCookieConsentServerSnapshot(): CookieConsentSnapshot {
  return "pending";
}

export function isCookieConsentAnswered(snapshot: CookieConsentSnapshot): boolean {
  return snapshot !== null && snapshot !== "pending";
}

export function shouldShowCookieConsentBanner(snapshot: CookieConsentSnapshot): boolean {
  return snapshot === null;
}

export function saveCookieConsent(
  decision: CookieConsentDecision,
  preferences: CookieConsentPreferences
): CookieConsentRecord {
  const record: CookieConsentRecord = {
    version: COOKIE_CONSENT_VERSION,
    decision,
    preferences,
    updatedAt: new Date().toISOString(),
  };
  consentClientHydrated = true;
  invalidateSnapshotCache();
  persistConsentRecord(record);
  snapshotCache = { signature: consentSignature(record), record };
  emit();
  return record;
}

export function acceptAllCookies(): CookieConsentRecord {
  return saveCookieConsent("accepted", { ...DEFAULT_ACCEPTED });
}

export function rejectOptionalCookies(): CookieConsentRecord {
  return saveCookieConsent("rejected", { ...DEFAULT_REJECTED });
}

export function saveCustomCookiePreferences(preferences: CookieConsentPreferences): CookieConsentRecord {
  return saveCookieConsent("customized", {
    performance: Boolean(preferences.performance),
    functional: Boolean(preferences.functional),
    advertising: Boolean(preferences.advertising),
  });
}

export function hasCookieConsentAnswered(): boolean {
  return readCookieConsent() !== null;
}

export function allowsCookieCategory(category: CookieCategory): boolean {
  const record = readCookieConsent();
  if (!record) return false;
  return record.preferences[category];
}

export function subscribeCookieConsent(listener: () => void): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== COOKIE_CONSENT_STORAGE_KEY) return;
    invalidateSnapshotCache();
    listener();
  };

  if (typeof window !== "undefined") {
    const hydrate = () => {
      if (consentClientHydrated) return;
      consentClientHydrated = true;
      invalidateSnapshotCache();
      listener();
    };
    queueMicrotask(hydrate);

    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return () => listeners.delete(listener);
}