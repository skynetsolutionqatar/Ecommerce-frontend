import { NextResponse } from "next/server";

/**
 * iOS Universal Links association for SKYNET Store.
 * Served at: https://store.skynetqatar.com/.well-known/apple-app-site-association
 *
 * Requires Vercel env `APPLE_TEAM_ID` (10-character Apple Developer Team ID).
 * Bundle ID is the real app id: com.skynet.ecomstore
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IOS_BUNDLE_ID = "com.skynet.ecomstore";

export async function GET() {
  const teamId = process.env.APPLE_TEAM_ID?.trim();
  if (!teamId) {
    return new NextResponse(
      "APPLE_TEAM_ID is not configured. Set the Apple Developer Team ID in Vercel env.",
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  const body = {
    applinks: {
      apps: [] as string[],
      details: [
        {
          appID: `${teamId}.${IOS_BUNDLE_ID}`,
          paths: ["/reset-password", "/reset-password/*"],
        },
      ],
    },
  };

  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
