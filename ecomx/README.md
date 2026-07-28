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
