"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { COOKIE_PREFERENCES_OPEN_EVENT } from "@/lib/store/cookie-consent";
import CookieConsentBar from "@/components/store/CookieConsentBar";
import CookiePreferencesModal from "@/components/store/CookiePreferencesModal";
import {
  useCookieConsentActions,
  useCookieConsentState,
  useShowCookieBanner,
} from "@/hooks/useCookieConsent";
import type { CookieConsentPreferences } from "@/lib/store/cookie-consent";

const DEFAULT_PREFS: CookieConsentPreferences = {
  performance: true,
  functional: true,
  advertising: false,
};

export default function CookieConsentHost() {
  const showBar = useShowCookieBanner();
  const { record } = useCookieConsentState();
  const { acceptAll, rejectAll, saveCustom } = useCookieConsentActions();
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefsSession, setPrefsSession] = useState(0);

  const modalInitial = useMemo<CookieConsentPreferences>(
    () => record?.preferences ?? DEFAULT_PREFS,
    [record]
  );

  const closePreferences = () => setPrefsOpen(false);

  useEffect(() => {
    const onOpen = () => {
      setPrefsSession((value) => value + 1);
      setPrefsOpen(true);
    };
    window.addEventListener(COOKIE_PREFERENCES_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(COOKIE_PREFERENCES_OPEN_EVENT, onOpen);
  }, []);

  if (!showBar && !prefsOpen) return null;
  if (typeof document === "undefined") return null;

  const layer = (
    <>
      {showBar ? (
        <CookieConsentBar
          onAccept={() => {
            closePreferences();
            acceptAll();
          }}
          onReject={() => {
            closePreferences();
            rejectAll();
          }}
          onCustomize={() => {
            setPrefsSession((value) => value + 1);
            setPrefsOpen(true);
          }}
          onLearnMore={closePreferences}
        />
      ) : null}
      <CookiePreferencesModal
        key={prefsSession}
        open={prefsOpen}
        initial={modalInitial}
        onClose={closePreferences}
        onLearnMore={closePreferences}
        onSave={(preferences) => {
          closePreferences();
          saveCustom(preferences);
        }}
      />
    </>
  );

  return createPortal(layer, document.body);
}