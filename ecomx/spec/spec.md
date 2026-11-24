# Product Specification — Skynet Ecommerce Frontend

Status: living document, reverse-engineered from the codebase on 2026-11-24.
Where code and this doc disagree, the code is the truth — update this file.

Related: [`architecture.md`](./architecture.md) (how it is built), [`../CLAUDE.md`](../CLAUDE.md) (working rules).

---

## 1. Purpose

A web storefront and back-office for **Skynet Solution Qatar**, selling POS systems, thermal printers, barcode scanners, IT hardware and the atACC ERP product line to customers in Qatar.

Two surfaces ship from one Next.js app:

| Surface | Audience | Where |
|---|---|---|
| **Storefront** | Anonymous shoppers and logged-in customers | `app/(store)/`, `app/(auth)/` |
| **Admin dashboard** | Store staff (admin, superadmin) and platform operators (developer, owner) | `app/(admin)/admin/` |

The app is **multi-tenant**: the same codebase can serve several stores; each deployment is bound to one tenant via `NEXT_PUBLIC_TENANT_ID`. Business data (products, orders, customers) lives in the backend API, not here.

---

## 2. Roles and access

| Role | Storefront | Admin panel | Notes |
|---|---|---|---|
| Guest | Browse, cart, wishlist, quote requests | No | Activity is tracked anonymously (see §7.6) |
| `customer` | Everything a guest can do, plus checkout, orders, reviews, addresses, password | No | Redirected away from admin login/register |
| `admin` | Storefront as a customer | Yes (store admin) | Store-level back office |
| `superadmin` | As admin | Yes | Store-level, full access |
| `developer` / `owner` | As customer | Only if the deployment is a platform hub | "Platform hub" roles manage tenants |

Deployment mode: when `NEXT_PUBLIC_DEVELOPER_PORTAL=true`, the admin panel is restricted to platform hub roles (`developer`, `owner`). Otherwise admins and superadmins use it.

Platform-only: creating and editing tenants (stores) and copying tenant IDs. Allowed for `developer`, `owner`, `superadmin`.

> The frontend role checks only control what is shown and where users are redirected. The API must enforce every permission.

---

## 3. Storefront

### 3.1 Pages

| Route | Purpose |
|---|---|
| `/` | Homepage: hero slider, promo banners, categories, flash offers, product rows, newsletter |
| `/shop` | Product listing with filters (category, search, price, etc.) |
| `/product/[slug]` | Product detail: gallery, purchase panel (or quote CTA), tabs, reviews, related products |
| `/product/[slug]/reviews` | All reviews for a product |
| `/checkout` | Cart review, delivery location, delivery quote, coupon, place order |
| `/orders` | Customer's orders |
| `/orders/[id]` | Order detail, status tracker, invoice download, cancel |
| `/account` | Profile |
| `/account/addresses` | Saved delivery addresses |
| `/account/password` | Change password |
| `/pages/[slug]` | CMS content pages: `faq`, `terms-and-conditions`, `cancellation-policy`, and others managed in admin |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Authentication |

Drawers and modals (no route): cart, wishlist, search, login prompt.

### 3.2 Catalog

- Products have a **slug**, images (gallery + alt image), **colors** and **sizes** variants, price, stock, categories, and a status (`draft`, `active`, `archived`).
- **Quote-only products** (`quoteOnly: true`) cannot be bought. Their "Add to cart" and "Buy now" open the product page, where the **Request a quote** modal collects an enquiry instead.
- Categories have a slug, an icon, and a count.
- Homepage sections are driven by the storefront config (`/storefront/*` endpoints): hero slides, featured products, flash offers. Some live components (wishlist drawer, product purchase panel, related products) still read demo data from `lib/data.ts` (known gap).

### 3.3 Cart

- **Guest:** cart lives in `localStorage` (`skynet_guest_cart`). Quantity is capped by stock.
- **Logged in:** cart lives on the server. On login, the guest cart is uploaded item by item, then localStorage is cleared, then the server cart is loaded.
- Add to cart opens the cart drawer. Buy now adds the item and goes straight to `/checkout`.
- Quantity can be changed and items removed in the drawer and at checkout.

### 3.4 Wishlist

- **Guest:** stored in `localStorage` (`skynet_guest_wishlist`). Heart state is instant.
- **Logged in:** toggled optimistically in the UI, then confirmed or reverted from the API response.
- On login, the guest wishlist is merged to the server (`POST /wishlist/merge`), then the server wishlist is loaded.
- "Move to cart" from the wishlist: quote-only products are routed to the product page. Logged-in users use the server move-to-cart call; guests add to the local cart and remove from the local wishlist.

### 3.5 Checkout and orders

1. **Cart review** — items, quantities, subtotal.
2. **Delivery location** — pick a country, district, and area (`/locations/*`), or search for an address (`/locations/search`), or pin it on a map (Leaflet + OpenStreetMap tiles). Saved addresses can be picked (`CheckoutAddressPickerModal`). The last address is cached in `localStorage` and cleared on logout.
3. **Delivery quote** — `/delivery-settings/quote` returns whether the location is deliverable, the distance, and the charge. Delivery promo text is driven by settings. If the charge is unknown, the UI does not show "FREE delivery".
4. **Coupon** — validated against `/coupons/validate` and applied with `/coupons/apply`. Discount types: percentage, fixed amount, free shipping.
5. **Place order** — `POST /orders`. The only payment method offered in the UI is **cash on delivery** (`cash_on_delivery`). The type file also lists `stripe`, `razorpay`, `myfatoorah`, but they are not wired up.
6. Order confirmation → `/orders/[id]`.

**Order lifecycle** (enforced by the admin status transitions in `lib/Constant.ts`):

```
pending → confirmed → processing → shipped → delivered → refunded
   │          │            │
   └──────────┴────────────┴──→ cancelled   (terminal)
```

- Customers can cancel their own order from `/orders/[id]` (`PATCH /orders/my/:id/cancel`) after confirming in a dialog. The action is irreversible.
- Invoices: PDF is generated in the browser from the order (`@react-pdf/renderer`, with the store logo, banner and QR code). The `app/api/orders/my/[id]/invoice` route also renders one server-side.

### 3.6 Reviews

- Logged-in customers who are **eligible** (have bought the product — see `hooks/useProductReviewEligibility.ts`) can write a review with a star rating.
- Reviews are moderated in admin (`pending` → `approved` / `rejected`). The frontend displays what the API returns; confirm the backend filters unapproved reviews from public endpoints (see §10).
- Product pages show the rating summary and recent reviews.

### 3.7 Account

- Profile view and edit (`/account`).
- Address book: create, edit, delete, set default (`/customers/addresses`).
- Change password, with the password rules in `lib/auth/password-rules.ts`.
- Forgot/reset password by email (email is sent by the backend; the project notes Resend as the mail provider).

### 3.8 Search

Global search modal (`SearchModal`) and the shop search param (`?search=`). Category links use `?category=`.

### 3.9 Guest activity

Anonymous shoppers are tracked so admins can see behaviour. Events (product views, cart changes, wishlist changes, cart viewed, etc.) are batched and sent to the backend every few seconds. Guests can save a phone number. When a guest logs in or registers, their guest activity is linked to the customer record.

Tracking is anonymous; the guest ID is in `localStorage` and the session ID is in `sessionStorage`.

### 3.10 Auth

- Email + password login and registration; **Sign in with Google** (Google Identity Services; the frontend only handles the credential, the backend verifies it).
- Login is prompted at checkout and on account pages. Browsing does not require login.
- If a session expires on a store page, the session is cleared silently. On an admin page, the user is sent to login with a `redirect` back.

---

## 4. Admin dashboard

All admin pages sit under `/admin/*` and require an admin-capable role (§2).

| Area | Routes | What it does |
|---|---|---|
| Dashboard | `/admin/dashboard` | KPIs, revenue/orders/customers charts, recent orders and transactions, low-stock table, order-status donut, performance card |
| Reports | `/admin/reports/[reportType]` | Filterable, paginated reports with export: `revenue`, `sales`, `orders`, `categories`, `customers`, `traffic-sources`, `campaigns`, `stock` |
| Products | `/admin/products`, `/add`, `/[id]`, `/edit/[id]` | Catalog CRUD, images, variants, quote-only flag, status |
| Categories | `/admin/categories`, `/add`, `/[id]`, `/edit/[id]` | Catalog taxonomy |
| Inventory | `/admin/inventory`, `/[productId]` | Stock levels; stock in, out, adjustment, return, damage movements; stock history |
| Orders | `/admin/orders`, `/[id]` | Search and filter orders, view details, move through the status lifecycle (§3.5) |
| Customers | `/admin/customers`, `/[id]` | Customer list, detail, enable/disable accounts |
| Guest activity | `/admin/guest-activity` | Visitor list, per-visitor timeline, summary |
| Coupons | `/admin/coupons`, `/add`, `/[id]`, `/edit/[id]` | Discount codes: percentage, fixed, free shipping; status `draft`, `active`, `paused`, `expired` |
| Reviews | `/admin/reviews`, `/[id]` | Moderate reviews (approve/reject) and delete |
| Hero sliders | `/admin/hero-sliders`, `/add`, `/[id]`, `/edit/[id]` | Homepage slider content, poster images, mode panel |
| Delivery settings | `/admin/delivery-settings` | Delivery charges, distance bands, promo text |
| Company | `/admin/company` | Company profile and details shown on the store and invoices |
| Content pages | `/admin/faq`, `/admin/terms-and-conditions`, `/admin/cancellation-policy` | Edit the fixed CMS pages |
| Tenants | `/admin/tenants`, `/add`, `/[slug]`, `/edit/[slug]` | Create and manage stores; copy tenant IDs (platform roles only) |

Admin UX features: light and dark theme (persisted), collapsible sidebar, mobile drawer nav, command search (⌘K style), live clock in the navbar (timezone from `NEXT_PUBLIC_CLOCK_TIMEZONE`, default Asia/Qatar), real-time notifications (new order, new review, low stock), password change dialog.

Notifications are pushed over Socket.IO (`new-order`, `new-review`, `low-stock`) and shown in the admin navbar dropdown (`components/admin/main/Notification.tsx`), with mark-one and mark-all-read. There is no dedicated notifications page.

---

## 5. Business rules (as implemented in the frontend)

| Rule | Where |
|---|---|
| Quote-only products cannot be added to cart or bought; they route to a quote request | `StoreProvider`, `ProductPurchasePanel` |
| Guest cart quantities are clamped to available stock when merged | `lib/store/cart-sync.ts` |
| Delivery charge unknown → do not display "FREE delivery" | Delivery promo helpers |
| Reviews require purchase eligibility and moderation before they appear | `useProductReviewEligibility`, admin reviews |
| Order cancellation is allowed only where the backend permits it; the customer must confirm | `CancelOrderDialog`, `orderApi.cancel` |
| Admin status moves follow `allowedTransitions` (§3.5) | `lib/Constant.ts` |
| Admin panel access: on a store deployment, `admin`/`superadmin` (and platform roles) may enter; with `NEXT_PUBLIC_DEVELOPER_PORTAL=true`, only platform hub roles may enter | `AdminAuthGuard`, `canAccessAdminPanel` |
| Redirects after login must be same-origin paths | `sanitizeRedirectPath` |

---

## 6. Branding and content

- Brand palette and typography come from `config/clients/skynet.ts`. Changing it also requires matching defaults in `app/globals.css` (`@theme`), or a dev-server restart.
- Client identity (name, phone, site URL, timezone) comes from the same client config; `NEXT_PUBLIC_CLIENT_ID` selects the profile (only `skynet` is registered).
- Fonts: Urbanist (`lib/fonts.ts`).
- Invoices show the Skynet logo, banner and a QR code.
- SEO metadata is set once in `app/layout.tsx` (title, description, keywords, Open Graph). Product and category pages do not yet have their own metadata.
- Universal links: `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json` are served for the mobile app (env: `APPLE_TEAM_ID`, `ANDROID_SHA256_CERT_FINGERPRINTS`).

---

## 7. Non-functional requirements

| Area | Requirement |
|---|---|
| Responsiveness | Works at phone width (16px side gutter, no horizontal page scroll), tablet and desktop, including 2K/4K store width |
| Themes | Storefront uses the brand theme; admin supports light and dark |
| Security | Strict CSP and security headers (`next.config.ts`); HSTS in production; no SVG image optimization; redirect sanitization; no secrets in the client bundle |
| Performance | Heavy components (drawers, modals, map, PDF, charts) are lazy-loaded; product rows are dynamic imports. Images use plain `<img>`/`StoreImage`, not `next/image` (the remote-host allowlist in `next.config.ts` is currently unused) |
| Accessibility | Dialogs and menus use Radix primitives; keep labels and focus states when adding UI |
| Browser support | Modern evergreen browsers; geolocation is enabled for the delivery map |
| Currency and locale | QAR-facing, Qatar timezone for the admin clock, English UI (`lang="en"`) |
| Availability | Depends on the backend API; the UI shows toasts and skeletons on failure |

---

## 8. Integrations

| Integration | Used for | Notes |
|---|---|---|
| Backend REST API | All data and auth | `NEXT_PUBLIC_API_URL`; Bearer token + `x-tenant-id` |
| Backend Socket.IO | Admin notifications, live order tracking | Same origin as the API |
| Google Identity Services | Sign in with Google | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (public half only) |
| OpenStreetMap tiles | Delivery location map | Via Leaflet |
| Google Fonts / local fonts | Typography | Urbanist self-hosted via `next/font` |
| Resend | Transactional email | Used by the backend (noted in README) |
| Unsplash / Cloudinary | Product and hero image hosts | Allowed in `next.config.ts` image patterns |

---

## 9. Out of scope (current frontend)

- Live payment processing. Only cash on delivery is offered at checkout.
- Server-side cart storage for guests (guests use localStorage until login).
- A customer-facing order-return flow (refunds exist as a status only).
- End-to-end (browser) test coverage. Unit tests exist for pure helpers only (`tests/unit/`).

---

## 10. Open questions and known gaps

1. **Payments.** Stripe, Razorpay, and MyFatoorah are in the type definitions but not in the UI. Is online payment planned, and which gateway?
2. **Demo data.** The wishlist drawer and product-page purchase/related components still read `lib/data.ts`. Migrate them to the API and delete the unreferenced homepage promo components.
3. **Auth cookie.** `proxy.ts` expects a cookie the frontend never sets, so server-side login redirects for logged-in users don't trigger. Decide whether to set a cookie or drop the proxy auth logic.
4. **Token storage.** Access and refresh tokens are in `localStorage`. Consider httpOnly cookies, which needs backend work.
5. **Secret in README.** A Firebase service-account key is committed inside `README.md` as an HTML comment. It must be rotated and removed from git history.
6. **SEO.** No per-product or per-category metadata, sitemap, or robots file yet.
7. **Tests.** Vitest unit tests cover pure helpers. Decide whether to add Playwright E2E coverage for checkout, the cart and wishlist merge on login, and admin access control.
8. **Stale README.** The README says the cart is local-only; it now syncs to the server when logged in.
