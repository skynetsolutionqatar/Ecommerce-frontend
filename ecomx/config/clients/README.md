# Multi-client theme

Set the active client with:

```bash
NEXT_PUBLIC_CLIENT_ID=skynet
```

## Add a new client

1. Create `config/clients/acme.ts` with `ClientConfig` (copy `skynet.ts`).
2. Register it in `config/clients/index.ts`.
3. Optional: add page overrides in `getPageThemeOverride()`.

## Per-page theme

Wrap any page with `PageTheme`:

```tsx
import { PageTheme } from "@/components/ThemeProvider";

export default function CheckoutPage() {
  return (
    <PageTheme pageId="checkout">
      {/* checkout UI */}
    </PageTheme>
  );
}
```

Then add `{ pageId: "checkout", theme: { ... } }` in `getPageThemeOverride()`.

All colors flow through CSS variables on `<html>`, set from **`config/clients/skynet.ts`** (single source of truth).

**Important:** After editing `skynet.ts`, also update the matching defaults in `app/globals.css` `@theme` (for Tailwind build) — or restart `npm run dev`. Theme is injected server-side in `app/layout.tsx` via `themeToCssProperties()`.
