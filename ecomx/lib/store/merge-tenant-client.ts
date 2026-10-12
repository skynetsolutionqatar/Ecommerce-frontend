import type { ClientConfig } from "@/config/clients/types";
import { API_CONFIG } from "@/lib/config";
import type { ApiTenant } from "@/types/tenant.types";

/** Resolve Google client ID: API tenant config first, then deployment env. */
export function resolveStoreGoogleClientId(tenant?: ApiTenant | null): string {
  const fromApi =
    tenant?.googleConfig?.enabled && tenant.googleConfig.clientId?.trim()
      ? tenant.googleConfig.clientId.trim()
      : "";
  if (fromApi) return fromApi;
  return API_CONFIG.googleClientId.trim();
}

export function mergeTenantIntoClient(
  base: ClientConfig,
  tenant?: ApiTenant | null
): ClientConfig {
  if (!tenant) return base;

  const primary = tenant.theme?.primaryColor?.trim();

  return {
    ...base,
    id: tenant.slug || base.id,
    name: tenant.name?.trim() || base.name,
    siteUrl:
      tenant.clientUrl?.trim() || API_CONFIG.clientUrl || base.siteUrl,
    theme: primary
      ? {
          ...base.theme,
          primary,
          primaryMid: primary,
        }
      : base.theme,
  };
}
