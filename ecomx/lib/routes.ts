/** Storefront URL paths — use with Next.js App Router and `router.push()`. */
export const ROUTES = {
  home: "/",
  shop: "/shop",
  orders: "/orders",
  orderDetail: (id: string) => `/orders/${id}`,
  checkout: "/checkout",
  product: (slug: string) => `/product/${slug}`,
  productReviews: (slug: string) => `/product/${slug}/reviews`,
  page: (slug: string) => `/pages/${slug}`,
  faq: "/pages/faq",
  terms: "/pages/terms-and-conditions",
  cancellationPolicy: "/pages/cancellation-policy",
} as const;

export function shopUrl(options?: { categoryId?: string; search?: string }) {
  const params = new URLSearchParams();
  if (options?.categoryId) params.set("category", options.categoryId);
  if (options?.search?.trim()) params.set("search", options.search.trim());
  const qs = params.toString();
  return qs ? `${ROUTES.shop}?${qs}` : ROUTES.shop;
}
