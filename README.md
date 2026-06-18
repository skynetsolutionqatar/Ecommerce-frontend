# Skynet E-Commerce - Frontend Storefront

A modern, high-performance, and responsive e-commerce storefront built using Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

---

## 🚀 Key Features

- **Next.js 16 App Router:** Optimized routing, server components, and layouts.
- **Tailwind CSS v4:** Premium, modern styling utilizing HSL color systems and micro-animations.
- **TypeScript:** Fully typed codebase for scalable and robust development.
- **SEO Optimized:** Structured semantic HTML, custom metadata configurations, and high performance.
- **Responsive Design:** Optimized for Desktop, Tablet, and Mobile layouts.

---

## 🛠️ Technology Stack

- **Core:** Next.js 16 (App Router), React 19, React DOM 19
- **Styling:** Tailwind CSS v4, PostCSS, Vanilla CSS variables
- **Language:** TypeScript
- **Linter:** ESLint (v9)

---

## 📦 Project Structure

```text
├── app/                  # Next.js App Router (pages, layouts, styles)
│   ├── favicon.ico       # Favicon
│   ├── globals.css       # Global stylesheet (Tailwind v4 imports)
│   ├── layout.tsx        # Main application layout
│   └── page.tsx          # Storefront homepage template
├── public/               # Static assets (images, SVGs, fonts)
├── eslint.config.mjs     # ESLint configuration
├── next.config.ts        # Next.js configuration
├── postcss.config.mjs    # PostCSS configuration for Tailwind CSS
├── tsconfig.json         # TypeScript configurations
└── package.json          # Project dependencies & scripts
```

---

## ⚙️ Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18.x or later recommended) and `npm` installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Build for Production
```bash
npm run build
```

### 5. Start Production Server
```bash
npm run start
```

---

## 🔗 Git Workflow & Deployment

### Switching Accounts
If you need to switch or check your active GitHub CLI account before pushing:
```bash
# Check status
gh auth status

# Switch account
gh auth switch
```

### Commits & Pushing
```bash
# Stage changes
git add .

# Create commit
git commit -m "feat: your feature message"

# Push to repository
git push origin main
```
