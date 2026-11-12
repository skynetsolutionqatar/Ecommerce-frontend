/** Target hero poster aspect — matches storefront slide min-height vs full width (~3.55:1) */
export const HERO_POSTER_SPECS = {
  width: 1920,
  height: 540,
  label: "1920 × 540 px (wide banner)",
} as const;

/** Full-bleed hero poster — fill frame without product-image width cap */
export function optimizeHeroPosterUrl(url: string): string {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (url.includes("w_1920") || url.includes("c_fill")) return url;
  const { width, height } = HERO_POSTER_SPECS;
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,w_${width},h_${height},c_fill,g_center/`
  );
}
