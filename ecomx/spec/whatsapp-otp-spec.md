# WhatsApp OTP — Specification

Status: **implemented, automated tests pass, real WhatsApp delivery confirmed on a handset (2026-11-26); full manual E2E not yet run** (branch `feat/whatsapp-otp` in both repos). Nothing below is marked done until it is built and tested.
Mirror copy lives in the backend repo (`store/spec/whatsapp-otp-spec.md`). Keep both in sync.

## 1. Context
- Frontend: Next.js 16 storefront (`ecomx`). Backend: Express 5 + MongoDB (`skynet-ecom-backend/Ecommerce-Backend/store`).
- Multi-tenant: every request carries `x-tenant-id`; challenges are scoped by `tenantId`.
- Existing channels: **Email OTP** (backend-owned code, Resend) and **SMS OTP** (MSG91 widget, Qatar + India).
- Goal: add **WhatsApp OTP** (Meta WhatsApp Cloud API) as a third channel in the login / sign-up modal. Meta only delivers the message. The backend generates, stores, verifies and expires the code.
- Out of scope: webhooks, delivery receipts, non-Qatar numbers, checkout-time phone verification (guest checkout uses the same modal login as Email OTP), replacing SMS/Email, Playwright installation.

## 2. Existing Email OTP architecture (reference)
Backend `src/modules/email-otp/`: `model` (one challenge per `tenantId`+`email`, TTL index on `expiresAt`), `service` (HMAC-SHA256 with pepper, `crypto.randomInt`, `timingSafeEqual`, 5 attempts, 5 sends, 30s cooldown, 10 min TTL), `route`, `controller`, `validation`. Verify success calls `AuthService.loginWithVerifiedEmail` and returns `AuthResponse`. Limiters: `emailOtpSendLimiter` (8/h/IP) on send+resend, `authLimiter` (20/15min) on verify.
Frontend: `components/auth/EmailOtpForm.tsx`, `OtpChannelPicker.tsx`, `LoginModal.tsx`, `hooks/useAuth.ts` (`confirmEmailOtp`), `lib/api/auth.api.ts`, `types/auth.types.ts`, `lib/api/auth-errors.ts`.

## 3. Customer flow
1. Login modal → picker → **WhatsApp**.
2. Enter 8-digit Qatar mobile → **Send code on WhatsApp**.
3. Backend validates, generates code, sends template via Meta, stores hash, returns `{ challengeId }`.
4. Customer enters 6-digit code → verify.
5. Backend verifies, then runs `loginWithVerifiedPhone(+974…)` (sign in, or create account) and returns `AuthResponse`.
6. Existing post-login behaviour (cart merge, redirect) runs unchanged.

## 4. Phone validation (Qatar only)
- Canonical rule (same as SMS): `^974[3567]\d{7}$` on digits-only form. Stored on `Customer.phone` as `+974XXXXXXXX`.
- Accepts `55123456`, `97455123456`, `+97455123456`. Rejects other countries, wrong length, prefixes outside 3/5/6/7.
- Note: spec examples treat any 8 digits as valid; we deliberately keep the existing prefix rule for consistency with SMS. Change in one shared helper if the numbering plan requires.
- Enforced on frontend (UX) and backend (authoritative). Backend reuses `parseMsg91PhoneIdentifier` restricted to the `974` branch; never accepts `91…`.

## 5. Meta Cloud API
- `POST https://graph.facebook.com/{WHATSAPP_API_VERSION}/{WHATSAPP_PHONE_NUMBER_ID}/messages`, `Authorization: Bearer {WHATSAPP_ACCESS_TOKEN}`, 15s timeout.
- Template: `skynet_store_login_otp`, category `AUTHENTICATION`, language `en_US`, 6-digit code, copy-code button.
- Payload: `type: "template"`, `template.name`, `language.code`, `components`: `body` with the code as `{{1}}` and, when `WHATSAPP_OTP_PURPOSE` is not empty, a second text parameter `{{2}}`, plus `button` (`sub_type: "url"`, `index: "0"`) with the code as its only text parameter.
- The approved `skynet_store_login_otp` body is "OTP Code: {{1}}. This is your OTP code for {{2}}. …", so it needs two body values. `WHATSAPP_OTP_PURPOSE` is optional: unset → "Skynet Store"; set empty → code only (for a standard one-blank template). Newlines are collapsed and the value is capped at 15 characters: Meta rejects longer authentication-template parameters (error 132018, seen with "Skynet Store login", 18 chars).
- Never use free-form text messages for OTP.
- Success = response contains `messages[0].id` (stored as `lastMessageId`). HTTP 200 is **not** proof of delivery and never marks a number verified.
- Env (backend only): `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_API_VERSION`, `WHATSAPP_OTP_TEMPLATE=skynet_store_login_otp`; optional `WHATSAPP_OTP_PEPPER` (falls back to `JWT_SECRET`, min 16 chars). If any required variable is missing: startup warning, endpoints return 503. No `NEXT_PUBLIC_*` WhatsApp secrets.

## 6. API (all under `/api/v1/auth/whatsapp-otp`, standard `{ success, message, data }`)
| Route | Body | Limiters | Result |
|---|---|---|---|
| `POST /send` | `{ phone }` | `whatsappOtpSendLimiter` | `{ challengeId }` |
| `POST /resend` | `{ challengeId }` | `whatsappOtpSendLimiter` | `{ challengeId }` |
| `POST /verify` | `{ challengeId, otp }` | `authLimiter` | `AuthResponse` |
Validation: `phone` per §4; `challengeId` Mongo id; `otp` `^\d{6}$`.

## 7. Data model
New `WhatsAppOtpChallenge` (separate from email model): `tenantId`, `phone` (digits, `974…`), `otpHash` (`select:false`), `expiresAt` (TTL index), `attempts`, `sendCount`, `lastSentAt`, `lastMessageId`. Unique index `tenantId+phone`. No schema change to Email or Customer; `isPhoneVerified`/`isEmailVerified` stay independent.

## 8. OTP logic and security
- Code: `crypto.randomInt(0, 1_000_000)` padded to 6. Hash: HMAC-SHA256(pepper, `${phone}:${otp}`). Compare with `timingSafeEqual`. Never store or log plaintext, tokens or full phone numbers.
- Expiry 5 min; max 5 attempts; resend cooldown 60s; max 5 sends per active window; fresh code on resend replaces the old hash (old code invalid).
- Persist the hash **only after Meta accepts** the send, so a failed delivery leaves no usable challenge. (If a previous challenge exists, a failed send leaves it unchanged and cooldown is not consumed.)
- Atomic verify: single `findOneAndUpdate` increments `attempts` only while not expired and `attempts < 5`; on correct code, delete atomically (`findOneAndDelete` with matching hash) so concurrent requests cannot both succeed; no reuse.
- Anti-enumeration: send returns the same shape whether or not an account exists; verify errors are generic ("incorrect or expired").
- Rate limits: `whatsappOtpSendLimiter` = 10/h/IP and 5/h/phone (key is hashed phone); verify via `authLimiter`.
- Error mapping for Meta: 4xx → 502 generic message (details logged without secrets); 429/5xx/timeout → 503 "try again".
- Consent: UI shows a line that a code will be sent via WhatsApp to the entered number.

## 9. Frontend
- `OtpChannel` becomes `"sms" | "email" | "whatsapp"`; picker gets a WhatsApp option.
- New `components/auth/WhatsAppOtpForm.tsx` modelled on `EmailOtpForm`/`PhoneOtpForm`: phone step (+974 fixed prefix, 8 digits), code step (6 digits, verify, resend with 60s countdown, "expires in 5 minutes"), loading/error states.
- New `lib/whatsapp-otp.ts` (Qatar parse/validate, `WHATSAPP_RESEND_SECONDS = 60`), API methods in `auth.api.ts`, types in `auth.types.ts`, `confirmWhatsAppOtp` in `useAuth`, messages in `auth-errors.ts`.
- Email and SMS code paths unchanged. Mobile: no horizontal scroll at phone width.

## 10. Tests
- Frontend: Vitest unit tests for `lib/whatsapp-otp.ts`.
- Backend: `node:test` with mocked `fetch` for Meta and a test database/in-memory fakes: normalization, hashing, expiry, attempts, reuse, concurrency, resend/cooldown, rate limits, Meta failure, purpose isolation.
- E2E: manual scripted scenarios in `spec/whatsapp-otp-e2e-testing.md` (Playwright not installed; adding it needs your approval). Real Meta delivery needs a real handset and is tested manually.
- Email OTP regression run after implementation.

## 11. Acceptance criteria
- [x] Qatar-only validation on both sides (frontend `tests/unit/whatsapp-otp.test.ts`; backend `test/whatsapp-otp/http.test.js`, `service.test.js`)
- [ ] Send / resend / verify work against Meta with the approved template — **send confirmed against real Meta (2026-11-26)**; resend and verify still to be checked in the manual E2E run
- Template copy issue (Meta side, not code): the approved body repeats "For your security, do not share this code." because the sentence was typed and "Add security recommendation" was also ticked. Fix by editing the template in WhatsApp Manager.
- [x] Code is hashed, expiring, attempt-limited, single-use, race-safe (in-memory and real-Mongo tests)
- [x] Failed Meta send leaves no usable challenge (and leaves an existing one and its cooldown unchanged)
- [x] Rate limits by IP (10/h) and phone (5/h, hashed key)
- [ ] Picker + form work; Email and SMS unchanged — builds and type-checks; **browser check pending** (`spec/whatsapp-otp-e2e-testing.md`)
- [x] Unit/integration tests pass — frontend Vitest 32/32; backend `node:test` 40/40, 46/46 with `WHATSAPP_OTP_TEST_MONGO_URI`
- [x] Manual real-device WhatsApp delivery confirmed (2026-11-26)
- [ ] Email OTP regression passes (manual; code paths untouched apart from the shared picker type)
- [x] No webhook code; no secrets in client code
- [x] Docs updated to match reality

## 12. Implementation notes
- Backend: `src/modules/whatsapp-otp/` — `phone`, `meta` (Cloud API client + config check), `model`, `repository` (atomic Mongo ops), `service` (`createWhatsAppOtpService` with injectable repo/sender/clock), `validation`, `controller`, `route`. Mounted at `/auth/whatsapp-otp` after `tenantMiddleware`. `server.js` calls `warnIfWhatsAppUnset()`.
- Concurrent sends to the same number: the second request may reach Meta, but only one challenge is stored (optimistic check on `lastSentAt`); the loser gets 429. The customer may receive a code that never verifies in that rare race.
- Resend's per-phone limit is enforced by looking up the challenge's number before the limiter. An unknown `challengeId` skips the phone limiter and is rejected by the service.
- `WHATSAPP_API_VERSION` example is `v27.0` (current in Meta's docs, Nov 2026).
- Meta's "WhatsApp Business Tools" MCP server (`https://mcp.facebook.com/whatsapp_business_tools`) is developer tooling that acts as your own account. It is useful for creating and checking the `skynet_store_login_otp` template and test numbers, but it is not used at runtime. The backend uses a System User token.
