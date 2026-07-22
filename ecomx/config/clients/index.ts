import { skynetClient } from "./skynet";
import type { ClientConfig, PageThemeOverride } from "./types";

const registry: Record<string, ClientConfig> = {
  skynet: skynetClient,
};

/** Active client — set NEXT_PUBLIC_CLIENT_ID=skynet (default) or add new clients to registry */
export function getClientConfig(clientId?: string): ClientConfig {
  const id = clientId ?? process.env.NEXT_PUBLIC_CLIENT_ID ?? "skynet";
  return registry[id] ?? skynetClient;
}

export function getPageThemeOverride(pageId: string): Partial<ClientConfig["theme"]> | null {
  const overrides: PageThemeOverride[] = [
    // Example: checkout page could use a calmer palette
    // { pageId: "checkout", theme: { bg: "#FFFFFF" } },
  ];
  return overrides.find((o) => o.pageId === pageId)?.theme ?? null;
}

export { skynetClient };
export type { ClientConfig, ClientTheme, PageThemeOverride } from "./types";
