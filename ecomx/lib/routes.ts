import { PRODUCTS } from "@/lib/data";
import type { Product } from "@/lib/types";

export type StorePage =
  | { type: "home" }
  | { type: "shop"; category?: string }
  | { type: "product"; product: Product }
  | { type: "orders" }
  | { type: "checkout" };

/** Named routes — URLs match these paths in the App Router */
export const ROUTES = {
  home: "/",
  shop: "/shop",
  orders: "/orders",
  checkout: "/checkout",
  product: (slug: string) => `/product/${slug}`,
} as const;

export function pageToPath(page: StorePage): string {
  switch (page.type) {
    case "home":
      return ROUTES.home;
    case "shop":
      return page.category
        ? `${ROUTES.shop}?category=${encodeURIComponent(page.category)}`
        : ROUTES.shop;
    case "product":
      return ROUTES.product(page.product.slug ?? String(page.product.id));
    case "orders":
      return ROUTES.orders;
    case "checkout":
      return ROUTES.checkout;
    default:
      return ROUTES.home;
  }
}

export function pathToPage(pathname: string, searchParams: URLSearchParams): StorePage {
  if (pathname === ROUTES.home) return { type: "home" };

  if (pathname === ROUTES.shop) {
    const category = searchParams.get("category");
    return { type: "shop", category: category ?? undefined };
  }

  if (pathname === ROUTES.orders) return { type: "orders" };
  if (pathname === ROUTES.checkout) return { type: "checkout" };

  const productMatch = pathname.match(/^\/product\/([^/]+)$/);
  if (productMatch) {
    const slug = decodeURIComponent(productMatch[1]);
    const product =
      PRODUCTS.find(p => p.slug === slug) ??
      PRODUCTS.find(p => String(p.id) === slug);
    if (product) return { type: "product", product };
  }

  return { type: "home" };
}

export function pageTypeFromPath(pathname: string): string {
  if (pathname === ROUTES.home) return "home";
  if (pathname.startsWith("/shop")) return "shop";
  if (pathname.startsWith("/product")) return "product";
  if (pathname === ROUTES.orders) return "orders";
  if (pathname === ROUTES.checkout) return "checkout";
  return "home";
}
