"use client";

import { useState, useMemo } from "react";
import { IMAGE_FALLBACK } from "@/lib/images";
import { withProductImageBlend } from "@/lib/store/product-image-utils";

function optimizeImageUrl(url: string, targetWidth = 400): string {
  if (!url || typeof url !== "string") return url;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    if (!url.includes("f_auto") && !url.includes("q_auto")) {
      return url.replace(
        "/upload/",
        `/upload/f_auto,q_auto,w_${Math.min(Math.max(targetWidth, 200), 800)},c_limit/`
      );
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
}: StoreImageProps) {
  const [hasError, setHasError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setHasError(false);
  }

  const optimizedSrc = useMemo(
    () => optimizeImageUrl(src, width ? width * 2 : 400),
    [src, width]
  );

  const displaySrc = hasError ? fallback : optimizedSrc;

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
