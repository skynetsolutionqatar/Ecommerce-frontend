/** Local IT/hardware photos — run `npm run images:demo` to refresh from Unsplash */

export const heroImage = (name: string) => `/images/hero/${name}.jpg`;
export const categoryImage = (name: string) => `/images/categories/${name}.jpg`;
export const productImage = (slug: string) => `/images/products/${slug}.jpg`;

/** Primary + hover/alt image for product cards and detail gallery */
export const productImages = (slug: string) => [
  productImage(slug),
  productImage(`${slug}-alt`),
];

export const IMAGE_FALLBACK = categoryImage("pos");
