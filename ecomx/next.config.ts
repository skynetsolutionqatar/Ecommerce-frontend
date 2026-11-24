import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/** Origin of the backend API — needed in connect-src so XHR/socket traffic is not blocked. */
const apiOrigin = (() => {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050/api/v1"
    ).origin;
  } catch {
    return "http://localhost:5050";
  }
})();

const socketOrigin = apiOrigin.replace(/^http/, "ws");

/** Google Identity Services (Sign in with Google popup / One Tap). */
const googleIdentitySrc = "https://accounts.google.com";

/** MSG91 phone OTP widget (https://verify.msg91.com/otp-provider.js) and its API. */
const msg91ScriptSrc = "https://verify.msg91.com https://control.msg91.com";
const msg91ConnectSrc =
  "https://verify.msg91.com https://control.msg91.com https://api.msg91.com";
/** Google reCAPTCHA, used when an MSG91 widget is configured for reCAPTCHA instead of hCaptcha. */
const captchaSrc = "https://www.google.com https://www.gstatic.com https://www.recaptcha.net";
/**
 * hCaptcha explicit render loaded by the MSG91 widget (`js.hcaptcha.com/1/api.js`).
 * `https://*.hcaptcha.com` is limited to that registrable domain — hCaptcha serves
 * the script, checkbox frame, and siteverify API from different subdomains.
 * `pass.hostnsoft.com` is only the widget's TraceIQ analytics tag, so it is not allowed.
 */
const hcaptchaSrc = "https://hcaptcha.com https://*.hcaptcha.com";
/** Inter, loaded by the MSG91 widget stylesheet. Font files are served by gstatic. */
const googleFontsStyleSrc = "https://fonts.googleapis.com";
const googleFontsFileSrc = "https://fonts.gstatic.com";

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js inlines its bootstrap/hydration scripts; dev also needs eval for HMR.
  // @react-pdf/renderer (invoice PDF) compiles WebAssembly in the browser — wasm-unsafe-eval in prod.
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' ${googleIdentitySrc} ${msg91ScriptSrc} ${captchaSrc} ${hcaptchaSrc}${isDev ? " 'unsafe-eval'" : ""}`,
  // Tailwind/framer-motion/react-pdf all emit inline style attributes.
  `style-src 'self' 'unsafe-inline' ${googleIdentitySrc} ${captchaSrc} ${hcaptchaSrc} ${googleFontsStyleSrc}`,
  // Remote product images (Cloudinary/Unsplash) and OpenStreetMap tiles.
  "img-src 'self' data: blob: https:",
  `font-src 'self' data: ${googleFontsFileSrc}`,
  `connect-src 'self' ${apiOrigin} ${socketOrigin} ${googleIdentitySrc} https://oauth2.googleapis.com ${msg91ConnectSrc} ${captchaSrc} ${hcaptchaSrc}${isDev ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  "media-src 'self' data: blob:",
  "manifest-src 'self'",
  `frame-src 'self' ${googleIdentitySrc} ${captchaSrc} ${hcaptchaSrc}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // geolocation stays enabled for the checkout delivery-location picker.
    value:
      "accelerometer=(), camera=(), display-capture=(), geolocation=(self), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  // Do not advertise the framework version to attackers.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    // Block SVG uploads from being rendered by the image optimizer (script-in-SVG XSS).
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
  },
  async headers() {
    return [
      {
        // Apple / Google association files — JSON, cacheable, no CSP needed for OS fetchers.
        source: "/.well-known/apple-app-site-association",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      { source: "/:path*", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
