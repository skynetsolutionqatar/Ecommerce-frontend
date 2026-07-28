/** Storefront URL paths — use with Next.js App Router and `router.push()`. */
export const ROUTES = {
  home: "/",
  shop: "/shop",
  orders: "/orders",
  checkout: "/checkout",
  product: (slug: string) => `/product/${slug}`,
} as const;

export function shopUrl(categoryId?: string) {
  if (!categoryId) return ROUTES.shop;
  return `${ROUTES.shop}?category=${encodeURIComponent(categoryId)}`;
}
