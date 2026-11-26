# Architecture — Skynet Ecommerce Frontend

Describes how the code is structured and how the pieces talk to each other.
For what the product does, see [`spec.md`](./spec.md). For working rules, see [`../CLAUDE.md`](../CLAUDE.md).

---

## 1. Overview

```
┌──────────────────────────── Browser ─────────────────────────────┐
│  Next.js client components (React 19)                            │
│   ├─ Storefront  (app/(store) → StoreProvider → StoreShell)      │
│   ├─ Admin       (app/(admin)/admin → AdminAuthGuard → Sidebar)  │
│   ├─ Auth        (app/(auth))                                    │
│   ├─ React Query (server state)   Zustand (client state)         │
│   └─ axios apiClient  ──────────┐   socket.io-client ──────┐     │
└────────────────────────────────┼──────────────────────────┼─────┘
                                 │ HTTPS REST               │ WebSocket
                                 ▼                          ▼
                     Backend API  (NEXT_PUBLIC_API_URL)   (same origin)
                     /api/v1/...  x-tenant-id header      Socket.IO events

Next.js server (same deployment)
   ├─ app/layout.tsx          root HTML, theme CSS vars, providers
   ├─ proxy.ts                request interception for /admin, /login, /register
   ├─ next.config.ts          CSP + security headers, image hosts, /.well-known
   └─ app/api/orders/my/[id]/invoice   server-side invoice PDF route
```

The frontend is a thin client over a separate backend. It holds no database. The backend enforces authorization, pricing, stock, and order rules.

---

## 2. Stack

| Concern | Choice (from `package.json`) |
|---|---|
| Framework | Next.js **16.2.9** App Router, React **19.2.4**, TypeScript 5 (strict) |
| Styling | Tailwind CSS **4** (`@tailwindcss/postcss`), CSS variables, `tw-animate-css`, `tailwind-merge`, `class-variance-authority` |
| UI primitives | Radix UI (`radix-ui`), shadcn-style components in `components/ui/`, `cmdk` for command search, `lucide-react` icons |
| Server state | TanStack React Query **5** (`components/QueryProvider.tsx`) |
| Client state | Zustand **5** (`store/`, persisted auth) |
| HTTP | axios **1** with interceptors (`lib/api/client.ts`) |
| Realtime | socket.io-client **4** |
| Forms | Formik **2** + Yup **1** |
| Charts | Recharts **3** |
| Maps | Leaflet **1** (OpenStreetMap tiles) |
| PDF / QR | `@react-pdf/renderer` **4**, `qrcode` |
| Animation | framer-motion **12** |
| Toasts | react-hot-toast **2** (`lib/toast.ts`) |
| Lint / build | ESLint 9 (`eslint-config-next`), `next build` as the type/build gate |
| Tests | Vitest 3 unit tests in `tests/unit/` (pure helpers). No browser E2E yet |

Dev-only: `sharp` (image tooling for scripts), `@types/*`.

---

## 3. Folder map

```
ecomx/
├─ app/                       Routes only (thin pages)
│  ├─ layout.tsx              Root: <html>, theme vars, QueryProvider, AuthInitializer, ThemeProvider
│  ├─ globals.css             Storefront Tailwind @theme + tokens
│  ├─ admin-globals.css       Admin theme
│  ├─ icon.png / apple-icon.png
│  ├─ (store)/                Storefront route group (StoreProvider + StoreShell in layout)
│  ├─ (auth)/                 login, register, forgot-password (AuthShell layout)
│  ├─ (admin)/admin/          Admin route group (AdminAuthGuard + Sidebar/Navbar in layout)
│  ├─ auth/google/callback/   Google sign-in callback page
│  ├─ api/orders/my/[id]/invoice/   Route handler: server-rendered invoice PDF
│  └─ .well-known/            apple-app-site-association, assetlinks.json (mobile universal links)
│
├─ components/                UI
│  ├─ (root)                  Shared storefront pieces (Header, Footer, ProductCard, Checkout*, Hero*, …)
│  ├─ store/                  Storefront feature components and the *Client page components
│  ├─ admin/                  Admin: main/ (Navbar, Sidebar), dashboard/, products/, reports/, shared/, form/, utils/
│  ├─ auth/                   AuthShell, AuthBrandPanel, AuthFormError
│  ├─ invoice/                InvoiceDocument (react-pdf layout)
│  └─ ui/                     Primitives (dialog, button, card, command, tooltip, …)
│
├─ hooks/                     React Query hooks and feature hooks (use*.ts). Wrap lib/api.
├─ lib/
│  ├─ api/                    One *.api.ts per backend resource + client.ts (axios) + errors
│  ├─ store/                  Storefront client logic: cart/wishlist local+sync, guest tracking, product mapping
│  ├─ admin/                  Admin form shapes, report config, timezone, theme transition
│  ├─ invoice/ pdf/           Invoice payload, styles, QR, fonts; generic table PDF
│  ├─ config.ts               API_CONFIG (env), role helpers, admin/auth route maps, post-login redirect
│  ├─ Constant.ts             Roles, statuses, transitions, STORAGE_KEYS, ROUTE_PREFIX, sanitizeRedirectPath
│  ├─ routes.ts               Storefront route helpers (ROUTES, shopUrl)
│  ├─ theme.ts / theme-css.ts Tailwind class tokens; client theme → CSS variables
│  ├─ data.ts                 ⚠ Demo data, still read by wishlist drawer and product page. To be removed.
│  └─ socket.ts               Socket.IO client singleton
├─ store/                     Zustand stores: auth.store.ts, ui.store.ts
├─ types/                     API payload/response types, one file per domain
├─ config/clients/            Brand profiles (skynet.ts) + registry (index.ts) + README
├─ proxy.ts                   Request interception (see §6)
├─ next.config.ts             CSP, headers, image config
├─ public/                    Static images (images/…), svg defaults
├─ scripts/                   Maintenance scripts (demo image download, invoice asset build, PDF test)
└─ README.md                  Original Next template text + project notes (see §12 for corrections)
```

### Layering rules

```
app/ (route + thin page)
  └─ components/ (UI, feature components, *Client)
       └─ hooks/ (React Query, feature logic)
            └─ lib/api/ (HTTP only)  ──→  lib/api/client.ts ──→ backend
       └─ store/ (Zustand) and components/StoreProvider.tsx (client state)
       └─ lib/ (pure helpers: mappers, formatters, validators, storage helpers)
types/ is imported everywhere; it has no runtime code.
```

Dependencies flow downward. `lib/api` must not import from `components` or `hooks`. `lib/store/*` helpers may call `lib/api`. Components may use hooks and stores.

---

## 4. Rendering model

- **Pages are thin.** Almost every `page.tsx` renders a client component: `app/(store)/shop/page.tsx` → `ShopPageClient`, `app/(store)/product/[slug]/page.tsx` → `ProductPageClient` (params unwrapped with `use()`), `app/(store)/checkout/page.tsx` → `CheckoutPageClient`.
- The storefront and admin UI are client-rendered (`"use client"`). The server renders the shell and metadata; product and order data are fetched in the browser through React Query.
- `app/(store)/pages/[slug]/page.tsx` is an `async` server component that awaits `params` and renders `ContentPageView`.
- No `generateMetadata`, `generateStaticParams`, or `revalidate` is used. SEO metadata is global (in `app/layout.tsx`).
- Heavy UI is loaded with `next/dynamic` / `React.lazy` (`lib/lazy.ts`, `components/LazyMount.tsx`). Examples: `SearchModal`, `LoginModal`, `CartDrawer`, `WishlistDrawer` (all `ssr: false` in `StoreShell`); `PromoBannerStrip`, `HomeProductRow`, `CategoriesSection`, `NewsletterSection` in `StoreHomePage`.

---

## 5. Provider tree

```
app/layout.tsx  (server)
 └─ <html style={themeToCssProperties(client.theme)}>      ← brand CSS variables
     └─ <body>
         └─ QueryProvider                                   React Query client (retry 1, no refetch on focus)
             └─ AuthInitializer                              rehydrates the persisted auth store once
                 └─ ThemeProvider (clientId)                 applies per-page theme
                     └─ UTMTracker
                         └─ page

app/(store)/layout.tsx
 └─ Suspense
     └─ StoreProvider          cart, wishlist, drawers, search, login modal, user, actions
         ├─ StoreThemeGuard
         ├─ GuestActivityTracker
         ├─ StoreShell         Header, Footer, drawers/modals (lazy)
         ├─ page
         └─ AppToaster

app/(admin)/admin/layout.tsx
 └─ AdminAuthGuard            blocks render until hydrated and admin; redirects otherwise
     └─ AdminThemeProvider    light/dark
         └─ Sidebar (desktop) + mobile drawer, Navbar, <main> with the page
         └─ AdminToaster
```

---

## 6. Routing and request interception

**`proxy.ts`** (Next 16's replacement for `middleware.ts`) runs for `/admin/:path*`, `/login`, `/register`.

- `/admin/*` → passes through. Access control is done client-side by `AdminAuthGuard`, because the token is not in a cookie.
- `/login`, `/register` → if the request has a valid-looking, unexpired JWT, redirect to `/admin/dashboard` (admins) or `/` (others). A `redirect` param is sanitized first.
- The token is decoded **without signature verification** and used for routing only. The comment in the file says the API re-validates every request.

⚠ **Known mismatch:** the proxy reads the cookie `skynet_access_token` (or an `Authorization` header). Nothing in the frontend sets that cookie; tokens live in `localStorage`. The redirect branch therefore only fires if some other system sets the cookie. Client guards are what actually protect routes today. See `spec.md` §10.

Storefront URLs are plain paths (`lib/routes.ts`): `/shop?category=…&search=…`, `/product/[slug]`, `/orders/[id]`, `/pages/[slug]`.

---

## 7. Auth and session

### Storage

| Key | Where | Contents |
|---|---|---|
| `skynet-auth` | `localStorage` (zustand `persist`) | `user`, `accessToken`, `refreshToken` |
| `skynet_access_token` | `localStorage` | Bearer token (mirrored by the store) |
| `skynet_refresh_token` | `localStorage` | Refresh token (mirrored by the store) |
| `admin-theme` | `localStorage` | Admin light/dark preference |
| `skynet_guest_cart`, `skynet_guest_wishlist`, `skynet_checkout_address` | `localStorage` | Guest data (see §8) |
| `skynet_guest_id` | `localStorage` | Persistent anonymous ID |
| `skynet_guest_session` | `sessionStorage` | Per-tab session ID |

### Flow

1. **Login / register / Google** (`hooks/useAuth.ts` → `lib/api/auth.api.ts`) returns `{ customer, accessToken, refreshToken }`.
2. `useAuthStore.setAuth` writes both tokens to `localStorage` and the store.
3. The guest activity is linked (`/guest-activity/link`), and the guest cart and wishlist are merged to the server by their hooks.
4. Destination is chosen by `getPostAuthRedirect(role, redirectTo)`.
5. On every request, `apiClient` adds `Authorization: Bearer <access>` and `x-tenant-id`.
6. On a `401`, the interceptor calls `/auth/refresh` once. Concurrent 401s share one `refreshPromise`. The request is retried with the new token. If refresh fails, both tokens are cleared, the auth store is cleared, and on admin paths the user is sent to `/login?reason=…&redirect=…`.
7. Routes listed in `shouldSkipAuthRefresh` (`lib/api/auth-errors.ts`) never trigger refresh.

### Authorization in the UI

- `selectIsAuthenticated` = access token and user present.
- `selectIsAdmin` = `canAccessAdminPanel(role)`.
- `AdminAuthGuard` redirects non-admins to `/` and unauthenticated users to login with `redirect=/admin/dashboard`.
- Some deployments are restricted to platform hub roles (`NEXT_PUBLIC_DEVELOPER_PORTAL`).

Token storage in `localStorage` is readable by any script that runs on the page. It is the main reason the CSP matters (§10).

---

## 8. Storefront state

### Cart (`hooks/useCart.ts`, `lib/store/cart-*.ts`, `lib/api/cart.api.ts`)

- **Guest:** `loadGuestCart` / `saveGuestCart` (localStorage). Items carry productId, color, size, qty, price, stock.
- **Logged in:** `cartApi` (`GET /cart`, `POST /cart/add`, `PATCH|DELETE /cart/items/:id`, `DELETE /cart`).
- **Login transition:** `mergeGuestCartToServer()` posts each guest line (qty clamped to stock), clears localStorage, then `applyServerCart()` loads the server cart.
- `buyNow` adds the product then routes to `/checkout`.

### Wishlist (`hooks/useWishlist.ts`, `lib/store/wishlist-*.ts`, `lib/api/wishlist.api.ts`)

- Guest: localStorage (`skynet_guest_wishlist`), with ids and items.
- Logged in: `GET /wishlist`, `GET /wishlist/ids`, `GET /wishlist/check/:id`, `POST /wishlist/toggle`, `POST /wishlist/merge`, `POST /wishlist/move-to-cart/:id`.
- Toggle is optimistic. It reverts on error.

### StoreProvider (`components/StoreProvider.tsx`)

Single context exposing cart, wishlist, UI open/closed flags, user, and actions (`addToCart`, `buyNow`, `updateCart`, `removeFromCart`, `toggleWishlist`, `addWishlistToCart`, `openProduct`, `goToShop`, `logout`). It enforces the quote-only rule (§spec 5). Components should use `useStore()` rather than the hooks directly.

### Guest activity (`components/store/GuestActivityTracker.tsx`, `lib/store/guest-activity-tracker.ts`)

Events are queued in memory (max 40), flushed every 4 s to `POST /guest-activity/events` with `guestId` and `sessionId`. Product views are debounced per product (8 s). Phone capture uses `POST /guest-activity/phone`. Admin reads `/guest-activity/*`.

### Checkout (`components/CheckoutPage.tsx` ~1.4k lines, `components/store/CheckoutPageClient.tsx`)

- Location: `lib/api/location.api.ts` (`/locations/countries`, `/districts`, `/areas`, `/search`, `/validate`, `/check-delivery`, `/deliverable-areas`). Map picker: `DeliveryMapPicker` (Leaflet).
- Quote: `lib/api/delivery-settings.api.ts` → `GET /delivery-settings/quote?lat&lng&subtotal`. Public settings: `GET /delivery-settings/public`.
- Coupons: `POST /coupons/validate`, `POST /coupons/apply`.
- Order: `orderApi.place` → `POST /orders` with `paymentMethod: "cash_on_delivery"`. Success invalidates order queries.
- Saved address cache: `lib/store/checkout-address-cache.ts` (cleared on logout).

### Orders and invoices

- Customer: `GET /orders/my`, `GET /orders/my/:id`, `GET /orders/my/track/:orderNumber`, `PATCH /orders/my/:id/cancel`.
- Live tracking: `hooks/useOrderTracking.ts` emits `track-order` and listens for `order-status-changed` and `order-update` on the socket.
- Invoice: `lib/invoice/*` builds the payload and styles. `generateInvoicePdfBlob` uses `@react-pdf/renderer` in the browser. `app/api/orders/my/[id]/invoice/route.tsx` does the same on the server, fetching `/orders/my/:id` with the caller's Authorization header and `x-tenant-id`.

### Reviews

- Eligibility: `hooks/useProductReviewEligibility.ts`, `lib/store/review-eligibility.ts`.
- `GET /reviews`, `GET /reviews/my`, `POST /reviews`. Admin: `PATCH /reviews/:id/moderate`, `DELETE /reviews/:id/admin`.

---

## 9. Admin state and data

- Each list, detail, and form is a route under `app/(admin)/admin/`. Data comes from `hooks/use*.ts`, which call `lib/api/*.api.ts`.
- List pages share the `components/admin/shared/` kit (`ListPageShell`, `ListToolbar`, `ListSearchBar`, `ListFilterSelect`, `ListTableCard`, `ListPagination`) and `lib/admin/client-pagination.ts`. Query params are built with `lib/api/query-params.ts` (`toQueryParams`).
- Forms: `components/admin/form/*` (Formik-bound inputs) with per-form shape and validation in `lib/admin/*-form.ts`.
- Reports: `hooks/useReport.ts`, config in `lib/admin/reports.config.ts`, export via `lib/api/report-export.api.ts` and `lib/admin/report-export.ts` (download via `triggerBrowserDownload`).
- Dashboard: `hooks/useDashboard.ts` → `lib/api/dashboard.api.ts`; charts in `components/admin/dashboard/` (Recharts).
- Menu: `hooks/useAdminMenuSections.ts` + `components/admin/main/Sidebar.tsx`.
- Notifications: `hooks/useNotifications.ts` (REST list + read, Socket.IO for `new-order`, `new-review`, `low-stock`), rendered by `components/admin/main/Notification.tsx`.
- Admin theme: `hooks/useAdminTheme.ts` (persisted), `components/admin/AdminThemeProvider.tsx`, transition helper in `lib/admin/theme-transition.ts`.
- Tenant management: `hooks/useTenants.ts`, `hooks/useTenantAccess.ts`, `lib/admin/tenant-access.ts`, `components/admin/tenants/TenantAdminGuard.tsx`.

---

## 10. API layer

### Client (`lib/api/client.ts`)

- `axios.create({ baseURL: API_CONFIG.baseURL, timeout: 30000, Content-Type: application/json })`.
- Request interceptor: `x-tenant-id` from `API_CONFIG.tenantId`, `Authorization` from `localStorage`. Removes `Content-Type` for `FormData`.
- Response interceptor: single-flight refresh on 401 (§7).
- Helpers: `apiGet(url, params)`, `apiPost`, `apiPatch`, `apiDelete`, all returning the `ApiResponse<T>` envelope. `triggerBrowserDownload` sanitizes filenames.
- Errors: `lib/api/errors.ts` and `lib/api/auth-errors.ts` turn API errors into messages. `QueryProvider` shows toasts for queries with `meta.toastOnError` and for mutations unless `meta.silentError` or the error is an auth error.

### Response envelope (`types/api.types.ts`)

```ts
{ success: boolean; message: string; data: T; pagination?: PaginationMeta; errors?: ... }
```

Pagination: `{ total, page, limit, totalPages, hasNextPage, hasPrevPage }`.

### Endpoint index (by module in `lib/api/`)

| Module | Base path(s) | Notes |
|---|---|---|
| `auth.api.ts` | `/auth/login`, `/auth/register`, `/auth/google/login`, `/auth/me`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/msg91/*`, `/auth/email-otp/*`, `/auth/whatsapp-otp/{send,resend,verify}` | OTP forms live in `components/auth/` (`PhoneOtpForm`, `EmailOtpForm`, `WhatsAppOtpForm`, picker `OtpChannelPicker`). WhatsApp phone rules: `lib/whatsapp-otp.ts`. OTP endpoints skip token refresh (`shouldSkipAuthRefresh`). |
| `product.api.ts` | `/products`, `/products/:id`, `/products/slug/:slug`, `/products/add`, `PATCH|DELETE /products/:id` | Admin write ops |
| `category.api.ts` | `/categories`, `/categories/:id`, `/categories/slug/:slug`, `/categories/add`, `PATCH|DELETE /categories/:id` | |
| `storefront.api.ts` | `/storefront/config`, `/storefront/hero`, `/storefront/featured`, `/storefront/flash-offers` | Homepage |
| `cart.api.ts` | `/cart`, `/cart/add`, `/cart/items/:id` | Logged in |
| `wishlist.api.ts` | `/wishlist*` | Logged in |
| `order.api.ts` | `/orders`, `/orders/stats`, `/orders/:id`, `/orders/:id/status`, `/orders/my*` | Customer and admin |
| `coupon.api.ts` | `/coupons`, `/coupons/:id`, `/coupons/validate`, `/coupons/apply` | |
| `customer.api.ts` | `/customers`, `/customers/:id`, `/customers/:id/toggle-status`, `/customers/profile`, `/customers/addresses*` | |
| `review.api.ts` | `/reviews`, `/reviews/my`, `/reviews/:id/moderate`, `/reviews/:id/admin` | |
| `hero-slider.api.ts` | `/hero-sliders`, `/hero-sliders/:id` | |
| `delivery-settings.api.ts` | `/delivery-settings`, `/delivery-settings/public`, `/delivery-settings/quote` | |
| `location.api.ts` | `/locations/countries`, `/districts`, `/areas`, `/deliverable-areas`, `/search`, `/validate`, `/check-delivery` | |
| `inventory.api.ts` | `/inventory/:productId` and stock movement routes | |
| `content-page.api.ts` | `/content-pages/:id`, `/content-pages/slug/:slug`, `/content-pages/manage/slug/:slug`, `/content-pages/add` | |
| `company.api.ts` | `/company` | |
| `tenant.api.ts` | `/tenants`, `/tenants/:id`, `/tenants/slug/:slug` | Platform roles |
| `dashboard.api.ts` | Dashboard aggregates | |
| `notification.api.ts` | `/notifications`, `/notifications/:id/read`, `/notifications/read-all` | |
| `guest-activity.api.ts` | `/guest-activity/events`, `/guest-activity/phone`, `/guest-activity/link`, admin reads | |
| `enquiry.api.ts` | `/enquiries` | Quote requests |
| `upload.api.ts` | `/upload` (`DELETE` used by the client) | Image uploads (`hooks/useUpload.ts`) |
| `report-export.api.ts` | report export endpoints | |

Realtime (Socket.IO, origin derived from `NEXT_PUBLIC_API_URL` with `/api/v1` removed):

| Event | Direction | Used by |
|---|---|---|
| `track-order` | client → server | `useOrderTracking` |
| `order-status-changed`, `order-update` | server → client | `useOrderTracking` |
| `new-order`, `new-review`, `low-stock` | server → client | `useNotifications` (admin) |
| `connect`, `disconnect` | — | `useNotifications` |

`lib/socket.ts` is a singleton with `autoConnect: false`. The token is passed in `auth`. It reconnects up to 5 times with a 2 s delay.

---

## 11. Configuration

### Environment variables (`.env.example`)

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | Backend base, e.g. `http://localhost:5050/api/v1`. Also used for CSP `connect-src` and the socket origin |
| `NEXT_PUBLIC_TENANT_ID` | yes | Sent as `x-tenant-id` on every request |
| `NEXT_PUBLIC_TENANT_SLUG` | yes | Tenant slug for the storefront |
| `NEXT_PUBLIC_CLIENT_URL` | yes | This deployment's public URL (should match tenant `clientUrl`) |
| `NEXT_PUBLIC_CLIENT_ID` | no | Brand profile; default `skynet` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | for Google login | Public OAuth client ID |
| `NEXT_PUBLIC_CLOCK_TIMEZONE`, `NEXT_PUBLIC_CLOCK_TIMEZONE_LABEL` | no | Admin clock; defaults Asia/Qatar, Doha |
| `NEXT_PUBLIC_DEVELOPER_PORTAL` | no | `"true"` restricts admin to platform hub roles |
| `NEXT_PUBLIC_APP_URL` | no | Fallback for `clientUrl` |
| `APPLE_TEAM_ID`, `ANDROID_SHA256_CERT_FINGERPRINTS` | server-only, for `.well-known` routes | Universal / app links |

**Rule:** every `NEXT_PUBLIC_*` value is inlined into the browser bundle. Never put secrets in env.

Other `process.env` reads: `NODE_ENV` (CSP dev relaxations, HSTS off in dev).

### Brand (`config/clients/`)

- `skynet.ts` is the single source of colors, name, phone, timezone, and site URL.
- `themeToCssProperties()` (`lib/theme-css.ts`) turns the theme into CSS variables on `<html>` in `app/layout.tsx`.
- `app/globals.css` `@theme` holds the matching Tailwind defaults. Keep them in sync when the brand changes.
- Per-page overrides: `getPageThemeOverride()` in `config/clients/index.ts`, used through `<PageTheme pageId>`.

### Security headers (`next.config.ts`)

- **CSP:** `default-src 'self'`; scripts allow Google Identity Services and `wasm-unsafe-eval` for react-pdf; `connect-src` includes the API and socket origins; `img-src` allows `https:` and `data:`; `frame-src` allows Google; `frame-ancestors 'none'`. Dev adds `unsafe-eval` and `ws:`. Prod adds `upgrade-insecure-requests`.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Opener-Policy: same-origin-allow-popups`, `Permissions-Policy` (geolocation only, for checkout), HSTS in production.
- `poweredByHeader: false`.
- Image remote patterns: `images.unsplash.com`, `res.cloudinary.com`. `dangerouslyAllowSVG: false`.

---

## 12. Build, scripts, and quality gates

| Command | What it does |
|---|---|
| `npm run dev` | Next dev server on :3000 |
| `npm run build` | Production build, type-check |
| `npm run start` | Serve the build |
| `npm run lint` | ESLint (`eslint.config.mjs`: next core-web-vitals + next TS) |
| `npm test` | Vitest unit tests, run once (`vitest.config.ts`, `tests/**/*.test.ts`, `@/` alias) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run images:demo` | `scripts/download-demo-images.sh` — fetches demo product/hero images |
| `scripts/knockout-hero-images.mjs` | Makes hero cutouts |
| `scripts/build-invoice-header-asset.ts`, `scripts/test-invoice-pdf.ts` | Invoice asset and PDF checks (run with a TS runner) |

`tsconfig.json` excludes `scripts/` from type-checking and maps `@/*` to the root.

`.gitignore` ignores `.env*` (except `.env.example`), `.next/`, `*.tsbuildinfo`, `next-env.d.ts`, and `tmp-*.pdf`.

---

## 13. Known issues and technical debt

| # | Issue | Impact | Where |
|---|---|---|---|
| 1 | **Firebase service-account private key committed** inside an HTML comment in `README.md` | Credential exposure; treat as compromised, rotate, purge from history | `README.md` |
| 2 | Tokens in `localStorage` | Any XSS can read them; CSP is the main mitigation | `lib/api/client.ts`, `store/auth.store.ts` |
| 3 | `proxy.ts` expects a cookie the frontend never sets | Login-redirect logic for logged-in users doesn't run; client guards do the work | `proxy.ts` |
| 4 | `lib/data.ts` demo data still read by live code: `WishlistDrawer` (via `StoreShell`) and the product page's purchase panel and related products (via `components/ProductPage.tsx`) | Stale/demo values can reach users; inconsistent with the API | `lib/data.ts` |
| 5 | `CheckoutPage.tsx` is ~1,450 lines | Hard to change safely | `components/CheckoutPage.tsx` |
| 6 | Dead components at the `components/` root with no static importers: `ProductModal`, `HeroPromoBanner`, `ProductCard`, `ReviewsSection`, `MegaMenu`, `DealCard`, `HardwarePromoBanner`, `TestimonialsSection`. Several `*Page` root components are duplicated by `store/*PageClient` | Confusion about what is live; dead code still imports demo data | `components/` root |
| 7 | No per-page metadata; no sitemap/robots | Weaker SEO | `app/` |
| 8 | Test coverage is limited to pure helpers (cart quantity and merge rules, redirect sanitization, status transitions, password rules). No UI or E2E tests | Cart/wishlist merge over the network, checkout, and admin access are still caught manually | `tests/unit/` |
| 9 | Payment types for Stripe/Razorpay/MyFatoorah are defined but unused | Dead types | `types/order.types.ts` |
| 10 | `next/image` configured but unused; `StoreImage` used instead | Remote image optimization is not active | `next.config.ts`, `components/StoreImage.tsx` |
| 11 | Storefront is fully client-rendered | Slower first meaningful content and weaker crawlability for product pages | `app/(store)/*` |

---

## 14. Corrections to `README.md`

The README is the Next.js template text plus notes. Some notes are out of date:

- "Cart: Local state in `StoreProvider` (not synced to backend yet)" is **no longer true**. Logged-in carts sync to `/cart`.
- "Products: Shop uses the API. Homepage hero/flash-sale sections still use demo data in `lib/data.ts`" is **not accurate for the live homepage**. `StoreHomePage` renders `HeroSection` and `FlashSaleSection`, and neither imports `lib/data.ts`. The live code that still reads demo data is the wishlist drawer and the product page's purchase panel and related products. The homepage promo components that used it are unreferenced.
- The wishlist section is accurate.
- The Firebase key block (item 1 above) must be removed. It is not documentation.
- The Resend note is a mail-provider hint for the backend, not used by this frontend.

Do not paste the key anywhere. Rotate it in Firebase/Google Cloud, then remove it from `README.md` and from git history.
