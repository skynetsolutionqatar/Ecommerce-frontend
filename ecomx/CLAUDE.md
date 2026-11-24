@AGENTS.md

# CLAUDE.md — Skynet Ecommerce Frontend

Guidance for Claude Code working in this repo. Read this first, then the specs:

- `spec/spec.md` — what the product does: features, roles, business rules, flows.
- `spec/architecture.md` — how it is built: folders, data flow, auth, API layer, config.

## What this is

Next.js 16 (App Router, React 19) storefront + admin dashboard for **Skynet Solution Qatar** (POS, printers, scanners, atACC ERP). It is a **client** of a separate backend API (Express/Socket.IO, default `http://localhost:5050/api/v1`). The backend owns all business logic and authorization; this frontend renders, validates input for UX, and calls the API.

Multi-tenant by design: every API request carries an `x-tenant-id` header from `NEXT_PUBLIC_TENANT_ID`.

## Commands

```bash
npm run dev      # next dev (http://localhost:3000)
npm run build    # next build — the main correctness gate (type-checks)
npm run start    # serve the production build
npm run lint     # eslint (eslint-config-next core-web-vitals + typescript)
npm test         # unit tests (Vitest, run once)
npm run test:watch # unit tests in watch mode
npx tsc --noEmit # type-check without building
```

Unit tests run with Vitest. See **Testing** below.

## Testing

Unit tests use **Vitest** (`vitest.config.ts`, `npm test`). Test files live in `tests/unit/` and match `tests/**/*.test.ts`. The `@/` alias works in tests the same as in app code.

Existing coverage (run `npm test`):
- `tests/unit/cart-helpers.test.ts`: quantity rules, guest cart merge and stock capping, server cart mapping.
- `tests/unit/rules.test.ts`: redirect sanitization, order status transitions, admin access, password rules.

Playwright (browser end-to-end) is **not** installed yet. Adding it is a dependency decision, so ask first.

### Required checks for every change

1. `npm test`, when your change touches logic covered by a unit test or adds new pure logic.
2. `npm run lint`
3. `npm run build` (includes the type-check). For a faster type-only check, run `npx tsc --noEmit`. Test files are type-checked too, because `tsconfig.json` includes all `.ts` files.
4. Run `npm run dev` and manually check the flows your change touches, using the checklist below. Browser flows are not covered by automated tests yet.

### Manual regression checklist

Run these against a backend on a **non-production tenant**. Use fake customers and orders only.

- **Guest cart:** add, change quantity (capped at stock), remove. Items survive a page refresh.
- **Cart merge on login:** guest cart and wishlist move to the server. `skynet_guest_cart` and `skynet_guest_wishlist` are cleared, and the server cart is shown.
- **Wishlist:** guest heart persists on refresh. Logged-in heart reverts if the API call fails.
- **Quote-only product:** Add to cart and Buy now open the product page and do not add to the cart.
- **Checkout:** a deliverable location shows a delivery quote. "FREE delivery" does not show when the charge is unknown. A valid coupon applies. A cash-on-delivery order places and appears in `/orders`.
- **Orders:** a customer can cancel from `/orders/[id]` after confirming. The invoice PDF downloads.
- **Admin access:** a non-admin visiting `/admin` is redirected to `/`. An admin can open list and detail pages. Status changes follow `allowedTransitions` in `lib/Constant.ts`.
- **Auth:** logout clears the auth store, the guest-cart state, and the cached checkout address. An expired session on an admin page redirects to `/login` with a `redirect` param.
- **Layout:** check at phone width (no horizontal scroll). Check admin in both light and dark themes.

### Test data

Never use real customer data in fixtures, screenshots, or bug reports. Don't commit `tmp-*.pdf` files, which the repo already ignores.

### Writing unit tests

- Unit-test pure logic only: helpers in `lib/` (no React, no `window`, no network). Good candidates still uncovered: `lib/store/cart-sync.ts` (guest merge, needs a mocked `cartApi`), `lib/api/query-params.ts`, and the wishlist helpers in `lib/store/wishlist-helpers.ts`.
- Put tests in `tests/unit/<name>.test.ts`, mirroring the module name.
- Don't test UI in Vitest. If UI tests are needed, ask first (they would need a DOM environment and Testing Library).
- Each test that touches `localStorage` must use a fake storage, not the real browser.
- End-to-end (Playwright) would cover checkout, the login-merge flow, and admin access control. It is not set up yet.
- When you add a test layer or a new test command, update this section and the `spec/` docs.

## Next.js is not the version you remember

`AGENTS.md` (imported above) applies: this is Next 16 with breaking changes. Before writing Next-specific code (routing, middleware/proxy, metadata, caching, `params` as a Promise), read the matching guide in `node_modules/next/dist/docs/`. Heed deprecation notices.

Concrete things already true in this repo:
- Request interception is in **`proxy.ts`** (exports `proxy`), not `middleware.ts`.
- Dynamic route `params` are **Promises** — unwrap with `use(params)` (client) or `await params` (server), as the existing pages do.

## Architecture rules (follow the existing pattern)

- **Thin pages, fat components.** `app/**/page.tsx` files are small wrappers that render a `components/...Client.tsx` or `components/...Page.tsx` component. Put UI logic in `components/`, not in `app/`.
- **API calls live only in `lib/api/*.api.ts`.** Each module exports an object of named methods (e.g. `orderApi.place`). Components and hooks never call `axios`/`apiClient` directly.
- **Data fetching goes through React Query hooks in `hooks/use*.ts`** that wrap `lib/api`. Use `meta: { silentError: true }` on mutations whose errors are handled inline, and `meta: { toastOnError: true }` on queries that should toast.
- **Shared client state** is Zustand in `store/` (`auth.store.ts`, `ui.store.ts`) or the store context in `components/StoreProvider.tsx` (cart, wishlist, drawers, search, login modal). Don't add a parallel state system.
- **Types** for API payloads/responses live in `types/*.types.ts`. Responses are wrapped in `ApiResponse<T>` (`types/api.types.ts`): read `res.data`.
- **Constants** (roles, order/coupon/product statuses, storage keys, route prefixes) live in `lib/Constant.ts`. Use them instead of string literals. Storage keys are in `STORAGE_KEYS`.
- **Role checks** go through `lib/config.ts` (`canAccessAdminPanel`, `getPostAuthRedirect`) and `lib/Constant.ts` helpers. The frontend check is UX only; the API enforces permissions.
- Import with the `@/` alias (maps to the project root).

## Conventions

- TypeScript `strict`. Avoid `any`; type API data with the `types/` files.
- Styling: Tailwind v4 + CSS variables. Brand colors come from `config/clients/skynet.ts` (see `config/clients/README.md`). Don't hardcode brand hex values in components.
- Forms: Formik + Yup (`lib/admin/*-form.ts`, `lib/auth/password-rules.ts` hold the validation shapes).
- Toasts: `lib/toast.ts` (`showError`, etc.) over react-hot-toast. Use `lib/api/errors.ts` / `auth-errors.ts` to turn API errors into messages.
- Icons: `lucide-react` (or the local `components/Icons.tsx`). UI primitives: `components/ui/` (shadcn-style).
- Mobile first: the storefront and admin must work at phone width without horizontal scroll.
- Keep new code near its feature folder; don't create new top-level folders without a reason.

## Security rules (do not weaken)

- **Never** commit secrets, service-account keys, or private keys. Only `NEXT_PUBLIC_*` values belong in env (they ship to the browser). Put server-only values in the backend.
- `next.config.ts` sets the CSP and security headers. If you add a new third-party script, frame, image host, or API origin, update the CSP there deliberately.
- Redirect targets from the URL must pass `sanitizeRedirectPath()` (`lib/Constant.ts`). Never redirect to an unvalidated `?redirect=` value.
- Do not render SVG uploads (`dangerouslyAllowSVG` is off) or raw HTML from user/API content without sanitizing.
- Tokens are currently kept in `localStorage` (see `spec/architecture.md` §Auth). Don't add more token copies; flag any change to this model for a decision.

## Known pitfalls

- `README.md` contains a **Firebase service-account private key inside an HTML comment**. It is tracked in git. Do not copy it anywhere, and treat it as compromised (see `spec/architecture.md` §Known issues).
- `proxy.ts` reads an access-token **cookie** (`skynet_access_token`) that the frontend never sets — tokens live in `localStorage`. Do not assume proxy-level auth redirects work for logged-in users; the client guards (`AdminAuthGuard`, `useAuth`) are what actually enforce them.
- `lib/data.ts` holds demo data still read by the wishlist drawer and the product-page purchase/related components. New features must use the API (`lib/api`), not `lib/data.ts`. Several root-level promo components are unreferenced; don't build on them.
- Cart and wishlist behave differently for guests (localStorage) and logged-in users (server). Changes to either must keep both paths working, including the merge on login.
- `.env` is gitignored and may hold local values. Never print or paste its contents into chats, docs, or commits. Use `.env.example` for variable names.

## Git

- Default branch: `main`. Work on a branch; don't commit to `main` directly.
- Commit only when asked. Use the commit style already in history (`feat:`, `fix:` prefixes).

## When updating these docs

If you change a folder structure, add a new API module, add a role, change auth/token storage, or add an env var, update `spec/architecture.md` (and `spec/spec.md` for user-facing behavior) in the same change.
