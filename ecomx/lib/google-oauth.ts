import { API_CONFIG } from "@/lib/config";
import { sanitizeRedirectPath } from "@/lib/Constant";

/** Start Google OAuth redirect flow (backend handles client secret + token exchange). */
export function getGoogleOAuthStartUrl(returnTo = "/"): string {
  const base = API_CONFIG.baseURL.replace(/\/$/, "");
  const params = new URLSearchParams({
    tenantId: API_CONFIG.tenantId,
    returnTo: sanitizeRedirectPath(returnTo),
  });
  return `${base}/auth/google?${params.toString()}`;
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(API_CONFIG.googleClientId);
}
