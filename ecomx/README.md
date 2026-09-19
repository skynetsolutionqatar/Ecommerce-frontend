This is a [Next.js](https://nextjs.org) App Router ecommerce frontend.

## Architecture (read this first)

```
app/(store)/          → Customer shop (standard Next.js pages)
app/(admin)/admin/    → Admin dashboard (standard Next.js pages)
app/(auth)/           → Login & register
hooks/                → React Query hooks (call lib/api)
lib/api/              → Backend API calls
components/           → UI components
types/                → API response TypeScript types
```

**Store:** Each URL renders its own page (`/shop`, `/product/[slug]`, etc.). Shared cart, wishlist, and modals live in `StoreProvider` + `StoreShell`.

**Admin:** Each list/detail/form is a normal page under `app/(admin)/admin/`. Data comes from `hooks/use*.ts` → `lib/api/*.api.ts`.

**Products:** Shop uses the API. Homepage hero/flash-sale sections still use demo data in `lib/data.ts` (to be migrated later).

**Cart:** Local state in `StoreProvider` (not synced to backend yet).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

whishList

GUEST (not logged in)
────────────────────────────────────
Click ♡ on any product
↓
productId saved to localStorage
↓
Heart turns red immediately
↓
Refresh page → still red ✅ (localStorage persists)

AFTER LOGIN
────────────────────────────────────
Login happens
↓
useWishlist hook detects isLoggedIn = true
↓
Calls POST /wishlist/merge with localStorage IDs
↓
Backend adds them to their account
↓
Fetches full wishlist with product details
↓
Store updated — same heart states ✅

LOGGED IN — NORMAL USAGE
────────────────────────────────────
Click ♡ → optimistic update (instant UI)
↓
API call in background
↓
Confirm/revert based on response

<!-- //admin sdk for firebase -->

<!-- {
  "type": "service_account",
  "project_id": "skynet-store-fd14e",
  "private_key_id": "307947af7492444ecb7e6678318a8b086a2dd824",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDb/i15UttnU9Cs\nje8Ib5F+jV3om2RjdEEQMvUJzljromSHJYT6wB1x9EuvkloGGPE7dqRGEraCBdnz\nCAEP1QgMnW3vLEGuGeOsyo/18nfEnWs+feoIfFJERswZz2c+wRgNbTb0lLVehR47\nQrnqpy1aLArQ92qNPFsx29tG596++95y8O3Xmulx+sMIr8cCHafs6ATNJ4ej222U\no7xHBw4IDEMIu8k0rcDLr1ls4bT57GAevhk2F3JeL6Z8yaOGa0LD2jVHEWxnurYa\nBA5rUukVhDOKfWo907iBKhOKm/Yol0qY15LyXT8OCcyd5aVnqtnySpSQzrLWbZUB\nDeZcmQ1LAgMBAAECggEAHca5E/dVkBZFo91wMaWcPVNYFyBVRaraFZ24EfQ2j+pC\njhJTffcb5S0qQ2DdQ38Dw8cqs/tbbZzqI519O03b0Y1LcHh+iViiuuQN+T2w3VFr\nTyGO2EgvgGNOw92RPWq4XTTfn9oy9FCzR1UgQfUPy+kzK5aZevVk6Io4E1BWE2ZW\ns3HNTtrjipa1dCXBbNwcQpkCRCedvtk9oISCezR7QCP0oukKStZZD6tx3RNjLAUH\nQAv7yNiWypgsQLY1/MdMDxMDFyk6KhUbW4AfHcYFJSZMu3n64YmnmHLadrGL/CiM\n4yTE7Zf6jzwPbepo45+zCpZ1BZGP28MYbUSfC2RT3QKBgQDyUXCW0sg1nLKvuuyv\nEzbb35+OrcaDhbPHB0XwuHLZu6TjSE8M25Yti1zyoVdCh0K3B4t5diQts0tClJkR\nYPt6heqe5KS7iqqGkKkFgNVk5nOExI9tWPd7kJzxltr0TQsYFGSxHCLRsp6wrrfU\nGNoPE/fp3v6+o74evq0MqxvX/wKBgQDoagpEgDUAabqIIcnNICKa+E8H6sVoTiYi\n26FE5+Ln7qH3NhSmaw2fHLHEeRw5hlqMW84RN3ZCKneuH4AaPAaMy27W7Jh9kiZo\nzjcoqih4GeXuMuXTHnpIzEph9i2HbcdbwJZ+M+FywxucPsdXqcsSzrIHz0aRwzsF\no2OKK4aqtQKBgQDemnwQwfAUeDAaiWCW8NLLqCIe43rjJfdiVkck/XzckqnF9Y5R\nJIRQsJ8hcaAEyNc75t11JlfT98qijnoTYgGDq/Q+JZNDif5fghMTsCfY+m+SvzN3\nY2xuggn7UfcwyHnxlAJwRYWjGDD55HeRi4b+pPxxR17EaQ3llorIgYQhpwKBgFJd\n0km4jhAZaEv6fYQ+0UTOn2OU5mUy3P0ZjSvYamf8AFaWSfc4lVlAWBfjPAd+//Qi\nTQN4/mYwmr2Q2FtzznZzWlK9AsXt18Lo4k99Dl6R/xTN4PlTIc9O50WUc0o9s5tm\nw27ygAGl99EFxqvgtuFxc1KlOMNLx00WPJ6pEk7JAoGABNOCN6VrjuFCvgy+iDSC\n5KfirQxqGAkpPj7ElZ46+h1VUyY8tGztFrD2eP0GBcwNFCvskul5TI0c1/nr+YCp\nEaD275KCRrK2xizze4WiUEBa0JQZNbrNmNaAD92CVfHQ1N8fxrktn+aHyX3pDF9/\nfhIv0eSKxSF7W1A9cSmal44=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@skynet-store-fd14e.iam.gserviceaccount.com",
  "client_id": "105042461571652681445",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40skynet-store-fd14e.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
} -->


<!-- use https://resend.com for mailing F & B -->