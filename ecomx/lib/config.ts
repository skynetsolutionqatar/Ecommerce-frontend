import {
  AUTH_PATH,
  isAdminRole,
  ROUTE_PREFIX,
  sanitizeRedirectPath,
  STORAGE_KEYS,
} from "@/lib/Constant";

export { isAdminRole, sanitizeRedirectPath };

export const API_CONFIG = {
  // baseURL: process.env.NEXT_PUBLIC_API_URL ?? "https://api-skynet-ecommerce-store.onrender.com/api/v1",
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050/api/v1",
  tenantId: process.env.NEXT_PUBLIC_TENANT_ID ?? "6a363c2f05587300d65b2720",
  tenantSlug: process.env.NEXT_PUBLIC_TENANT_SLUG ?? "skynet",
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
} as const;

export const ADMIN_ROUTES = {
  dashboard: `${ROUTE_PREFIX.ADMIN}/dashboard`,
  reports: `${ROUTE_PREFIX.ADMIN}/reports`,
  report: (type: string) => `${ROUTE_PREFIX.ADMIN}/reports/${type}`,
  products: `${ROUTE_PREFIX.ADMIN}/products`,
  product: (id: string) => `${ROUTE_PREFIX.ADMIN}/products/${id}`,
  orders: `${ROUTE_PREFIX.ADMIN}/orders`,
  order: (id: string) => `${ROUTE_PREFIX.ADMIN}/orders/${id}`,
  customers: `${ROUTE_PREFIX.ADMIN}/customers`,
  categories: `${ROUTE_PREFIX.ADMIN}/categories`,
  category: (id: string) => `${ROUTE_PREFIX.ADMIN}/categories/${id}`,
  inventory: `${ROUTE_PREFIX.ADMIN}/inventory`,
  inventoryUpdate: (productId: string) =>
    `${ROUTE_PREFIX.ADMIN}/inventory?update=${encodeURIComponent(productId)}`,
  inventoryProduct: (productId: string) => `${ROUTE_PREFIX.ADMIN}/inventory/${productId}`,
  coupons: `${ROUTE_PREFIX.ADMIN}/coupons`,
  coupon: (id: string) => `${ROUTE_PREFIX.ADMIN}/coupons/${id}`,
  reviews: `${ROUTE_PREFIX.ADMIN}/reviews`,
  review: (id: string) => `${ROUTE_PREFIX.ADMIN}/reviews/${id}`,
  customer: (id: string) => `${ROUTE_PREFIX.ADMIN}/customers/${id}`,
  tenants: `${ROUTE_PREFIX.ADMIN}/tenants`,
  tenant: (slug: string) => `${ROUTE_PREFIX.ADMIN}/tenants/${slug}`,
  tenantEdit: (slug: string) => `${ROUTE_PREFIX.ADMIN}/tenants/edit/${slug}`,
  company: `${ROUTE_PREFIX.ADMIN}/company`,
  faq: `${ROUTE_PREFIX.ADMIN}/faq`,
  terms: `${ROUTE_PREFIX.ADMIN}/terms-and-conditions`,
  cancellationPolicy: `${ROUTE_PREFIX.ADMIN}/cancellation-policy`,
} as const;

export const AUTH_ROUTES = {
  login: AUTH_PATH.LOGIN,
  register: AUTH_PATH.REGISTER,
  forgotPassword: AUTH_PATH.FORGOT_PASSWORD,
  resetPassword: AUTH_PATH.RESET_PASSWORD,
} as const;

export const TOKEN_KEYS = {
  access: STORAGE_KEYS.ACCESS_TOKEN,
  refresh: STORAGE_KEYS.REFRESH_TOKEN,
} as const;

/** Resolve where to send the user after login/register. Pass `null` to skip redirect (e.g. store modal). */
export function getPostAuthRedirect(
  role: string | undefined,
  redirectTo?: string | null
): string | null {
  if (redirectTo === null) return null;

  const fallback = isAdminRole(role) ? ADMIN_ROUTES.dashboard : "/";
  if (redirectTo) return sanitizeRedirectPath(redirectTo, fallback);
  return fallback;
}
