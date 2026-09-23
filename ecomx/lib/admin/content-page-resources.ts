import { ADMIN_ROUTES } from "@/lib/config";
import { ROUTES } from "@/lib/routes";

export type FixedContentPageKey = "faq" | "terms-and-conditions" | "cancellation-policy";

export type FixedContentPageResource = {
  key: FixedContentPageKey;
  slug: FixedContentPageKey;
  adminRoute: string;
  storeRoute: string;
  menuLabel: string;
  title: string;
  description: string;
  saveLabel: string;
};

export const FIXED_CONTENT_PAGE_RESOURCES: FixedContentPageResource[] = [
  {
    key: "faq",
    slug: "faq",
    adminRoute: ADMIN_ROUTES.faq,
    storeRoute: ROUTES.faq,
    menuLabel: "FAQ",
    title: "FAQ",
    description: "Frequently asked questions shown on the storefront and footer",
    saveLabel: "Save FAQ",
  },
  {
    key: "terms-and-conditions",
    slug: "terms-and-conditions",
    adminRoute: ADMIN_ROUTES.terms,
    storeRoute: ROUTES.terms,
    menuLabel: "Terms & Conditions",
    title: "Terms & Conditions",
    description: "Store terms and conditions linked from the footer",
    saveLabel: "Save Terms",
  },
  {
    key: "cancellation-policy",
    slug: "cancellation-policy",
    adminRoute: ADMIN_ROUTES.cancellationPolicy,
    storeRoute: ROUTES.cancellationPolicy,
    menuLabel: "Cancellation Policy",
    title: "Cancellation Policy",
    description: "Order cancellation policy linked from the footer",
    saveLabel: "Save Policy",
  },
];

export function getFixedContentPageResource(slug: string): FixedContentPageResource | undefined {
  return FIXED_CONTENT_PAGE_RESOURCES.find((resource) => resource.slug === slug);
}
