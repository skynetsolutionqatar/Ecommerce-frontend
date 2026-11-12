"use client";

import { useState, useMemo } from "react";
import { IMAGE_FALLBACK } from "@/lib/images";
import { withProductImageBlend } from "@/lib/store/product-image-utils";

function optimizeImageUrl(
  url: string,
  targetWidth = 400,
  fit: "limit" | "cover" = "limit"
): string {
  if (!url || typeof url !== "string") return url;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    if (!url.includes("f_auto") && !url.includes("q_auto")) {
      const w = Math.min(Math.max(targetWidth, 200), 1920);
      const transform =
        fit === "cover"
          ? `f_auto,q_auto,w_${w},c_fill,g_auto`
          : `f_auto,q_auto,w_${w},c_limit`;
      return url.replace("/upload/", `/upload/${transform}/`);
    }
  }
  return url;
}

interface StoreImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  fallback?: string;
  draggable?: boolean;
  "aria-hidden"?: boolean;
  /** Set true for above-the-fold hero images */
  priority?: boolean;
  /** `cover` fills the frame (posters); default `limit` preserves product shots */
  fit?: "limit" | "cover";
  /**
   * Knocks out white JPG backgrounds via `mix-blend-multiply`.
   * Pair with {@link productImageSurfaceClass} on the parent frame.
   */
  blend?: boolean;
}

/** Image with local fallback and automatic Cloudinary optimization */
export default function StoreImage({
  src,
  alt,
  width,
  height,
  className = "",
  style,
  fallback = IMAGE_FALLBACK,
  draggable,
  "aria-hidden": ariaHidden,
  priority = false,
  blend = true,
  fit = "limit",
}: StoreImageProps) {
  const [hasError, setHasError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setHasError(false);
  }

  const trimmedSrc = src?.trim() ?? "";

  const optimizedSrc = useMemo(() => {
    if (!trimmedSrc) return fallback;
    return optimizeImageUrl(trimmedSrc, width ? width * 2 : 400, fit);
  }, [trimmedSrc, width, fit, fallback]);

  const displaySrc = hasError || !trimmedSrc ? fallback : optimizedSrc;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displaySrc}
      alt={alt}
      width={width}
      height={height}
      aria-hidden={ariaHidden}
      draggable={draggable}
      className={blend ? withProductImageBlend(className) : className}
      style={style}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onError={() => {
        if (!hasError) setHasError(true);
      }}
    />
  );
}
