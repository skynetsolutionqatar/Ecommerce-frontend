/**
 * Shared product-image surface + blend helpers.
 * White JPG backgrounds multiply into {@link PRODUCT_IMAGE_SURFACE}.
 */
export const PRODUCT_IMAGE_SURFACE = "#f8fafc";

/** Tailwind surface class for product image frames. */
export const productImageSurfaceClass = "bg-[#f8fafc]";

export const productImageBlendClass = "mix-blend-multiply";

/** Default classes for a contained product photo. */
export function productImageClass(extra = "") {
  const base = "h-full w-full object-contain object-center mix-blend-multiply";
  return extra ? `${base} ${extra}`.trim() : base;
}

/** Wrapper that keeps multiply blending against the slide/tile surface. */
export function productImageWrapClass(extra = "") {
  const base = "relative flex h-full w-full items-center justify-center mix-blend-multiply";
  return extra ? `${base} ${extra}`.trim() : base;
}

/** Append multiply blend unless already present. */
export function withProductImageBlend(className = "") {
  if (/mix-blend-/i.test(className)) return className;
  return `${className} ${productImageBlendClass}`.trim();
}
