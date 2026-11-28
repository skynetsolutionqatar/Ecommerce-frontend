import { Colors } from "@/lib/theme";
import type { ApiCategory } from "@/types/category.types";

const HEADER_NAVY = "#0a255d";

/** Gold field for the header category strip. Maroon is the matching ink. */
export const CATEGORY_LIST_INK = "#7f1d1d";
export const CATEGORY_LIST_BACKGROUND =
  "linear-gradient(100deg, #fde047 0%, #facc15 48%, #f59e0b 100%)";

/** Shop by Category uses the store base color, with cream type on top. */
export const SHOP_CATEGORY_INK = "#fff7ed";
export const SHOP_CATEGORY_BACKGROUND = Colors.base_color;

/** Hero product row: yellow, maroon, and red as one family. */
export const HERO_CATALOG_BANNER_SURFACES = [
  { background: "linear-gradient(135deg, #fde047 0%, #f59e0b 100%)", color: "#7f1d1d" },
  { background: "linear-gradient(135deg, #7f1d1d 0%, #9f1239 100%)", color: "#fff7ed" },
  { background: "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)", color: "#fff7ed" },
] as const;

const BY_SLUG: Record<string, string> = {
  "barcode-scanner": "#1D3F7A",
  "barcode-scanners": "#1D3F7A",
  "pos-systems": "#2B2A78",
  "pos-system": "#2B2A78",
  consumables: "#0F5257",
  "label-printers": "#5A2E6E",
  printers: "#1D4E7A",
  "cash-drawers": "#6B3A1C",
  scanners: "#2E4A6B",
  displays: "#334063",
  hardware: "#3A3F5C",
  networking: "#1F5A3A",
  security: "#6A2338",
  "security-cctv": "#6A2338",
  "servers-storage": "#24435E",
  software: "#26206B",
  "weighing-scale": "#3A3F5C",
};

const BY_NAME: [RegExp, string][] = [
  [/barcode/, "#1D3F7A"],
  [/label/, "#5A2E6E"],
  [/cash|drawer/, "#6B3A1C"],
  [/consum|ribbon|roll/, "#0F5257"],
  [/pos\b|point of sale/i, "#2B2A78"],
  [/print/, "#1D4E7A"],
  [/scan/, "#2E4A6B"],
  [/display|monitor/, "#334063"],
  [/cctv|camera|security/, "#6A2338"],
  [/network|wifi|router/, "#1F5A3A"],
  [/server|storage/, "#24435E"],
  [/software|erp/, "#26206B"],
  [/weigh|scale/, "#3A3F5C"],
  [/hardware/, "#3A3F5C"],
];

export function resolveCategoryBannerColor(category: Pick<ApiCategory, "name" | "slug">): string {
  const slug = category.slug?.trim().toLowerCase();
  if (slug && BY_SLUG[slug]) return BY_SLUG[slug];
  const name = category.name.trim();
  for (const [re, color] of BY_NAME) {
    if (re.test(name)) return color;
  }
  return HEADER_NAVY;
}