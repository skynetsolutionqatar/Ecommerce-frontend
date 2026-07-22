"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { getClientConfig, getPageThemeOverride } from "@/config/clients";
import type { ClientConfig, ClientTheme } from "@/config/clients/types";

interface ThemeContextValue {
  client: ClientConfig;
  theme: ClientTheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(client: ClientConfig, pageId?: string) {
  const root = document.documentElement;
  root.dataset.client = client.id;
  if (pageId) root.dataset.page = pageId;
  else delete root.dataset.page;

  const override = pageId ? getPageThemeOverride(pageId) : null;
  const t = { ...client.theme, ...override };

  root.style.setProperty("--color-bg", t.bg);
  root.style.setProperty("--color-bg-soft", t.bgSoft);
  root.style.setProperty("--color-primary", t.primary);
  root.style.setProperty("--color-primary-mid", t.primaryMid);
  root.style.setProperty("--color-primary-light", t.primaryLight);
  root.style.setProperty("--color-accent", t.accent);
  root.style.setProperty("--color-accent-hover", t.accentHover);
  root.style.setProperty("--color-accent-soft", t.accentSoft);
  root.style.setProperty("--color-accent-light", t.accentLight);
  root.style.setProperty("--color-muted", t.muted);
  root.style.setProperty("--color-border", t.border);
}

interface ThemeProviderProps {
  children: React.ReactNode;
  clientId?: string;
  pageId?: string;
}

export default function ThemeProvider({ children, clientId, pageId }: ThemeProviderProps) {
  const client = useMemo(() => getClientConfig(clientId), [clientId]);
  const theme = useMemo(() => {
    const override = pageId ? getPageThemeOverride(pageId) : null;
    return { ...client.theme, ...override };
  }, [client, pageId]);

  useEffect(() => {
    applyTheme(client, pageId);
  }, [client, pageId]);

  const value = useMemo(() => ({ client, theme }), [client, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useClientTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { client: getClientConfig(), theme: getClientConfig().theme };
  }
  return ctx;
}

/** Wrap a single page to apply optional per-page theme overrides */
export function PageTheme({ pageId, children }: { pageId: string; children: React.ReactNode }) {
  const { client } = useClientTheme();
  useEffect(() => {
    applyTheme(client, pageId);
    return () => applyTheme(client);
  }, [client, pageId]);
  return <>{children}</>;
}
