import {
  AUTH_PATH,
  isAdminRole,
  ROUTE_PREFIX,
  STORAGE_KEYS,
} from "@/lib/Constant";

export { isAdminRole };

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050/api/v1",
  tenantId: process.env.NEXT_PUBLIC_TENANT_ID ?? "6a363c2f05587300d65b2720",
} as const;

export const ADMIN_ROUTES = {
  dashboard: `${ROUTE_PREFIX.ADMIN}/dashboard`,
  products: `${ROUTE_PREFIX.ADMIN}/products`,
  product: (id: string) => `${ROUTE_PREFIX.ADMIN}/products/${id}`,
  orders: `${ROUTE_PREFIX.ADMIN}/orders`,
  order: (id: string) => `${ROUTE_PREFIX.ADMIN}/orders/${id}`,
  customers: `${ROUTE_PREFIX.ADMIN}/customers`,
  categories: `${ROUTE_PREFIX.ADMIN}/categories`,
  category: (id: string) => `${ROUTE_PREFIX.ADMIN}/categories/${id}`,
  inventory: `${ROUTE_PREFIX.ADMIN}/inventory`,
  inventoryProduct: (productId: string) => `${ROUTE_PREFIX.ADMIN}/inventory/${productId}`,
  coupons: `${ROUTE_PREFIX.ADMIN}/coupons`,
  coupon: (id: string) => `${ROUTE_PREFIX.ADMIN}/coupons/${id}`,
  reviews: `${ROUTE_PREFIX.ADMIN}/reviews`,
  review: (id: string) => `${ROUTE_PREFIX.ADMIN}/reviews/${id}`,
  customer: (id: string) => `${ROUTE_PREFIX.ADMIN}/customers/${id}`,
} as const;

export const AUTH_ROUTES = {
  login: AUTH_PATH.LOGIN,
  register: AUTH_PATH.REGISTER,
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
  if (redirectTo) return redirectTo;
  if (isAdminRole(role)) return ADMIN_ROUTES.dashboard;
  return "/";
}
