# WhatsApp OTP — Manual E2E Script

Playwright is not installed, so these steps are run by hand. Use a **non-production tenant** and your own test handset. Don't use real customer numbers.

## Setup
1. Backend `.env`: set the five `WHATSAPP_*` variables (System User token, approved `skynet_store_login_otp` template). Start it. The log should say `✅ WhatsApp Cloud API configured`.
2. Frontend: `npm run dev` with `NEXT_PUBLIC_TENANT_ID` set to the test tenant and OTP login enabled.
3. Open the storefront in a phone-width window (375 px) and a desktop window.

## Scenarios
| # | Steps | Expected |
|---|---|---|
| 1 | Sign In → OTP Login | Picker shows Text message, WhatsApp, Email. No horizontal scroll. |
| 2 | WhatsApp → enter `45123456` → Send | Inline error about an 8-digit Qatar number starting with 3, 5, 6 or 7. No network request. |
| 3 | Paste `+974 5xxx xxxx` (your test handset) | Field shows the 8 national digits. Consent line visible. |
| 4 | Send code on WhatsApp | Code step shows the formatted number, "expires in 5 minutes", resend countdown from 60 s. WhatsApp message arrives with a copy-code button. |
| 5 | Enter a wrong code | "That code is incorrect or has expired…". |
| 6 | Wait for countdown → Resend | New message arrives. The **old** code is now rejected. The new code works. |
| 7 | Enter the right code | "Signed in!", modal closes. Guest cart and wishlist merge (see CLAUDE.md checklist). New number creates a customer with phone `+974…`. |
| 8 | Sign out, repeat with the same number | Signs into the same customer (no duplicate). |
| 9 | Enter 5 wrong codes, then the right one | Still rejected. Request a new code. |
| 10 | Send, wait > 5 min, enter the code | Rejected as expired. |
| 11 | Send 6 times in an hour to one number (wait 60 s between) | 6th send → "Too many codes sent to this number…". |
| 12 | Unset `WHATSAPP_ACCESS_TOKEN`, restart, try to send | "WhatsApp sign-in is not available right now…". Startup log warns. |
| 13 | Change number link on the code step | Back to the phone step, countdown cleared. |
| 14 | Regression: Email OTP and Text message OTP full sign-in | Both still work unchanged. |

## Checks after the run
- Backend logs show masked numbers only (`***NN`), never the code or the token.
- `whatsappotpchallenges` holds only `otpHash`, never the plaintext code. Rows disappear after successful verify, or after expiry via TTL.

## Results log
| Date | Tester | Scenarios passed | Notes |
|---|---|---|---|
| | | | |
