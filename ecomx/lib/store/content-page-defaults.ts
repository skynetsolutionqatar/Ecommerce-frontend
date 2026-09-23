import { ROUTES } from "@/lib/routes";

/** Fallback footer links when API is unavailable (matches backend default slugs). */
export const FALLBACK_FOOTER_LINKS = [
  { slug: "faq", label: "FAQ", href: ROUTES.page("faq") },
  { slug: "terms-and-conditions", label: "Terms & Conditions", href: ROUTES.page("terms-and-conditions") },
  { slug: "cancellation-policy", label: "Cancellation Policy", href: ROUTES.page("cancellation-policy") },
] as const;
