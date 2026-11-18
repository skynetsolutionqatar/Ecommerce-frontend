import { NextResponse } from "next/server";

/**
 * Android App Links association for SKYNET Store.
 * Served at: https://store.skynetqatar.com/.well-known/assetlinks.json
 *
 * Package: com.skynet.ecomstore
 *
 * Fingerprints (never invent):
 * - Always includes the SHA-256 of the checked-in Expo/Android debug.keystore
 *   (for local/debug App Link verification).
 * - Plus any production fingerprints from Vercel env
 *   `ANDROID_SHA256_CERT_FINGERPRINTS` (comma-separated), typically:
 *   EAS upload keystore + Google Play App Signing cert.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ANDROID_PACKAGE = "com.skynet.ecomstore";

/**
 * SHA-256 of `ecom-mobile/android/app/debug.keystore` alias `androiddebugkey`
 * (extracted with jks-js — standard Android debug cert used by this repo).
 */
const DEBUG_KEYSTORE_SHA256 =
  "FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C";

function normalizeFingerprint(raw: string): string | null {
  const cleaned = raw.trim().replace(/[^0-9a-fA-F]/g, "").toUpperCase();
  if (cleaned.length !== 64) return null;
  return cleaned.match(/.{2}/g)!.join(":");
}

function collectFingerprints(): string[] {
  const fromEnv = (process.env.ANDROID_SHA256_CERT_FINGERPRINTS ?? "")
    .split(",")
    .map(normalizeFingerprint)
    .filter((v): v is string => Boolean(v));

  const all = [DEBUG_KEYSTORE_SHA256, ...fromEnv];
  return [...new Set(all)];
}

export async function GET() {
  const fingerprints = collectFingerprints();

  const body = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: ANDROID_PACKAGE,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ];

  return new NextResponse(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
