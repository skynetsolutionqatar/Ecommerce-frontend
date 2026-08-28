import { BRAND_LOGO, BRAND_LOGO_FOOTER } from "@/lib/images";

interface BrandLogoProps {
  className?: string;
  imgClassName?: string;
  height?: number;
  alt?: string;
  priority?: boolean;
  /**
   * default — full-color on light backgrounds
   * light — white mark on dark gradients (auth panel, mobile menu)
   * footer — transparent PNG, full brand colors on dark footer
   */
  variant?: "default" | "light" | "footer";
}

export default function BrandLogo({
  className = "",
  imgClassName = "",
  height = 32,
  alt = "Skynet Solution",
  priority = false,
  variant = "default",
}: BrandLogoProps) {
  const src = variant === "footer" ? BRAND_LOGO_FOOTER : BRAND_LOGO;

  const variantClass =
    variant === "light"
      ? "brightness-0 invert opacity-95"
      : variant === "footer"
        ? "object-left drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
        : "object-left";

  return (
    <span className={`inline-flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        height={height}
        className={`block w-auto max-w-full object-contain ${variantClass} ${imgClassName}`}
        style={{ height, maxHeight: height }}
        fetchPriority={priority ? "high" : undefined}
        draggable={false}
      />
    </span>
  );
}
