import { API_CONFIG } from "@/lib/config";

export const GOOGLE_GSI_SCRIPT_URL = "https://accounts.google.com/gsi/client";

/** @deprecated Redirect flow shows the API host on Google's consent screen. Prefer GIS + POST /auth/google/login. */
export function getGoogleOAuthStartUrl(returnTo = "/"): string {
  const base = API_CONFIG.baseURL.replace(/\/$/, "");
  const params = new URLSearchParams({
    tenantId: API_CONFIG.tenantId,
    returnTo: returnTo.startsWith("/") ? returnTo : "/",
  });
  return `${base}/auth/google?${params.toString()}`;
}

export function isGoogleOAuthConfigured(googleClientId?: string): boolean {
  const id = googleClientId?.trim() || API_CONFIG.googleClientId.trim();
  return Boolean(id);
}

export type GoogleCredentialResponse = {
  credential?: string;
  select_by?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: "signin" | "signup" | "use";
            ux_mode?: "popup" | "redirect";
          }) => void;
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              getNotDisplayedReason: () => string;
              getSkippedReason: () => string;
            }) => void
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

let gsiScriptPromise: Promise<void> | null = null;

function waitForGoogleIdentityReady(timeoutMs = 8000): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        reject(new Error("Google sign-in is not ready yet."));
        return;
      }
      window.setTimeout(tick, 50);
    };
    tick();
  });
}

/** Load Google Identity Services once (store origin — masks API host on consent UI). */
export function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in is only available in the browser."));
  }
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }
  if (gsiScriptPromise) {
    return gsiScriptPromise;
  }

  gsiScriptPromise = new Promise((resolve, reject) => {
    const finish = () => {
      waitForGoogleIdentityReady().then(resolve).catch(reject);
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_GSI_SCRIPT_URL}"]`
    );
    if (existing) {
      if (existing.dataset.gsiError === "1") {
        reject(new Error("Failed to load Google sign-in"));
        return;
      }
      if (window.google?.accounts?.id || existing.dataset.gsiLoaded === "1") {
        finish();
        return;
      }
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google sign-in")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_GSI_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.gsiLoaded = "1";
      finish();
    };
    script.onerror = () => {
      script.dataset.gsiError = "1";
      reject(new Error("Failed to load Google sign-in"));
    };
    document.head.appendChild(script);
  });

  return gsiScriptPromise;
}

export function initializeGoogleSignIn(
  clientId: string,
  onCredential: (credential: string) => void
): void {
  if (!window.google?.accounts?.id) {
    throw new Error("Google sign-in is not ready yet.");
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      const credential = response.credential?.trim();
      if (credential) {
        onCredential(credential);
      }
    },
    auto_select: false,
    cancel_on_tap_outside: true,
    context: "signin",
    ux_mode: "popup",
  });
}

type GooglePromptNotification = {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
};

/** Open Google account chooser (must run from a click handler). */
export function promptGoogleSignIn(
  momentListener?: (notification: GooglePromptNotification) => void
): void {
  window.google?.accounts?.id?.prompt(momentListener);
}
