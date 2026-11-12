/** Desktop hero poster — 1920 × 620 */
export const HERO_POSTER_DESKTOP_SIZE = "1920 × 620 px";
export const HERO_POSTER_DESKTOP_WIDTH = 1920;
export const HERO_POSTER_DESKTOP_HEIGHT = 620;
export const HERO_POSTER_DESKTOP_ASPECT = HERO_POSTER_DESKTOP_WIDTH / HERO_POSTER_DESKTOP_HEIGHT;
export const HERO_POSTER_DESKTOP_TOLERANCE = 0.08;

/** Mobile hero poster — 1080 × 1350 */
export const HERO_POSTER_MOBILE_SIZE = "1080 × 1350 px";
export const HERO_POSTER_MOBILE_WIDTH = 1080;
export const HERO_POSTER_MOBILE_HEIGHT = 1350;
export const HERO_POSTER_MOBILE_ASPECT = HERO_POSTER_MOBILE_WIDTH / HERO_POSTER_MOBILE_HEIGHT;
export const HERO_POSTER_MOBILE_TOLERANCE = 0.08;

function loadImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions"));
    };
    img.src = url;
  });
}

function aspectMatches(
  width: number,
  height: number,
  target: number,
  tolerance: number,
  expectedW: number,
  expectedH: number
): boolean {
  if (height <= 0) return false;
  const aspect = width / height;
  const min = target - tolerance;
  const max = target + tolerance;
  const exactSize = width === expectedW && height === expectedH;
  return exactSize || (aspect >= min && aspect <= max);
}

export async function validateHeroPosterDesktopFile(file: File): Promise<string | null> {
  try {
    const { width, height } = await loadImageSize(file);
    if (
      !aspectMatches(
        width,
        height,
        HERO_POSTER_DESKTOP_ASPECT,
        HERO_POSTER_DESKTOP_TOLERANCE,
        HERO_POSTER_DESKTOP_WIDTH,
        HERO_POSTER_DESKTOP_HEIGHT
      )
    ) {
      return `Desktop poster must be ${HERO_POSTER_DESKTOP_SIZE} (wide). This file is ${width}×${height}px.`;
    }
    return null;
  } catch {
    return "Could not read this image. Use JPG, PNG, or WebP.";
  }
}

export async function validateHeroPosterMobileFile(file: File): Promise<string | null> {
  try {
    const { width, height } = await loadImageSize(file);
    if (
      !aspectMatches(
        width,
        height,
        HERO_POSTER_MOBILE_ASPECT,
        HERO_POSTER_MOBILE_TOLERANCE,
        HERO_POSTER_MOBILE_WIDTH,
        HERO_POSTER_MOBILE_HEIGHT
      )
    ) {
      return `Mobile poster must be ${HERO_POSTER_MOBILE_SIZE} (portrait). This file is ${width}×${height}px.`;
    }
    return null;
  } catch {
    return "Could not read this image. Use JPG, PNG, or WebP.";
  }
}

export function posterPairIsComplete(posterImg: string, posterImgMobile: string): boolean {
  return Boolean(posterImg.trim() && posterImgMobile.trim());
}

/** Legacy storefront poster — desktop banner only */
export function posterLegacyDesktopReady(posterImg: string): boolean {
  return Boolean(posterImg.trim());
}
