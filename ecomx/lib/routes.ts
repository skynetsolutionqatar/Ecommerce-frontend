/** Storefront URL paths — use with Next.js App Router and `router.push()`. */
export const ROUTES = {
  home: "/",
  shop: "/shop",
  orders: "/orders",
  orderDetail: (id: string) => `/orders/${id}`,
  checkout: "/checkout",
  account: "/account",
  accountAddresses: "/account/addresses",
  accountPassword: "/account/password",
  product: (slug: string) => `/product/${slug}`,
  productReviews: (slug: string) => `/product/${slug}/reviews`,
  page: (slug: string) => `/pages/${slug}`,
  faq: "/pages/faq",
  terms: "/pages/terms-and-conditions",
  cancellationPolicy: "/pages/cancellation-policy",
} as const;

export function shopUrl(options?: {
  categoryId?: string;
  search?: string;
  deals?: boolean;
  listing?: boolean;
  brand?: string;
  hasDiscount?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  maxPrice?: number;
}) {
  const params = new URLSearchParams();
  if (options?.categoryId) params.set("category", options.categoryId);
  if (options?.search?.trim()) params.set("search", options.search.trim());
  if (options?.deals) params.set("deals", "1");
  if (options?.listing) params.set("listing", "1");
  if (options?.brand) params.set("brand", options.brand);
  if (options?.hasDiscount) params.set("sale", "1");
  if (options?.isNew) params.set("new", "1");
  if (options?.isBestSeller) params.set("bestseller", "1");
  if (options?.maxPrice != null) params.set("maxPrice", String(options.maxPrice));
  const qs = params.toString();
  return qs ? `${ROUTES.shop}?${qs}` : ROUTES.shop;
}
