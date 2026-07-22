import type {
  Product, Category, Testimonial, HeroSlide, NavMenu, Review
} from "./types";
import { heroImage, categoryImage, productImages, productImage } from "./images";

// ─── PRODUCTS: POS Systems & IT Hardware ──────────────────────────────────────
export const PRODUCTS: Product[] = [
  {
    id: 33,
    discountPct: 18,
    slug: "honeywell-pc42t-label-printer",
    name: "Honeywell PC42t Desktop Label Printer",
    brand: "Honeywell",
    price: 899,
    originalPrice: 1099,
    isNew: true,
    isBestSeller: true,
    rating: 4.8,
    reviews: 542,
    colors: [{ name: "Gray", hex: "#D1D5DB" }],
    sizes: ["4 Inch"],
    badge: "WAREHOUSE",
    badgeColor: "#0F766E",
    images: productImages("honeywell-pc42t-label-printer"),
    tags: ["Label Printing", "USB", "Barcode", "203 DPI"],
    description: "Compact desktop barcode and label printer designed for warehouses and retail inventory management.",
    category: "Label Printers",
    stock: 22,
    sku: "HW-PC42T",
    brand_logo: "Honeywell",
  },

  {
    id: 34,
    discountPct: 12,
    slug: "zebra-tc22-mobile-computer",
    name: "Zebra TC22 Mobile Computer",
    brand: "Zebra",
    price: 2499,
    originalPrice: 2799,
    isNew: true,
    isBestSeller: true,
    rating: 4.9,
    reviews: 218,
    colors: [{ name: "Black", hex: "#111827" }],
    sizes: ["6 Inch"],
    badge: "MOBILE POS",
    badgeColor: "#7C3AED",
    images: productImages("zebra-tc22-mobile-computer"),
    tags: ["Android", "Inventory", "Barcode", "WiFi 6"],
    description: "Enterprise-grade handheld mobile computer for inventory, warehousing, and field sales.",
    category: "Mobile Computers",
    stock: 14,
    sku: "ZEB-TC22",
    brand_logo: "Zebra",
  },

  {
    id: 35,
    discountPct: 15,
    slug: "datalogic-magellan-3450vsi",
    name: "Datalogic Magellan 3450VSi",
    brand: "Datalogic",
    price: 1699,
    originalPrice: 1999,
    isNew: false,
    isBestSeller: true,
    rating: 4.8,
    reviews: 187,
    colors: [{ name: "Black", hex: "#111827" }],
    sizes: ["Counter Scanner"],
    badge: "RETAIL",
    badgeColor: "#0891B2",
    images: productImages("datalogic-magellan-3450vsi"),
    tags: ["1D", "2D", "QR", "Retail Checkout"],
    description: "High-performance presentation scanner for supermarket and retail checkout counters.",
    category: "Scanners",
    stock: 19,
    sku: "DAT-3450",
    brand_logo: "Datalogic",
  },

  {
    id: 36,
    discountPct: 10,
    slug: "zkteco-f18-attendance",
    name: "ZKTeco F18 Access Control Terminal",
    brand: "ZKTeco",
    price: 699,
    originalPrice: 799,
    isNew: false,
    isBestSeller: true,
    rating: 4.7,
    reviews: 395,
    colors: [{ name: "Black", hex: "#111827" }],
    sizes: ["Fingerprint"],
    badge: "SECURITY",
    badgeColor: "#DC2626",
    images: productImages("zkteco-f18-attendance"),
    tags: ["Fingerprint", "RFID", "Access Control"],
    description: "Professional biometric access control and employee attendance system.",
    category: "Security",
    stock: 38,
    sku: "ZKT-F18",
    brand_logo: "ZKTeco",
  },

  {
    id: 37,
    discountPct: 20,
    slug: "ups-1500va-online",
    name: "PowerGuard 1500VA Online UPS",
    brand: "PowerGuard",
    price: 899,
    originalPrice: 1129,
    isNew: true,
    isBestSeller: false,
    rating: 4.6,
    reviews: 154,
    colors: [{ name: "Black", hex: "#111827" }],
    sizes: ["1500VA"],
    badge: "POWER",
    badgeColor: "#EA580C",
    images: productImages("ups-1500va-online"),
    tags: ["UPS", "Backup", "Pure Sine Wave"],
    description: "Online UPS system designed for POS counters, servers, and networking equipment.",
    category: "Power Solutions",
    stock: 17,
    sku: "PG-UPS1500",
    brand_logo: "PowerGuard",
  },

  {
    id: 38,
    discountPct: 22,
    slug: "atacc-restaurant-pos",
    name: "atACC Restaurant POS Professional",
    brand: "atACC",
    price: 1499,
    originalPrice: 1899,
    isNew: true,
    isBestSeller: true,
    rating: 5.0,
    reviews: 847,
    colors: [{ name: "Digital", hex: "#A16207" }],
    sizes: ["Unlimited Terminals"],
    badge: "SOFTWARE",
    badgeColor: "#0891B2",
    images: productImages("atacc-restaurant-pos"),
    tags: ["Restaurant", "Kitchen Display", "Delivery"],
    description: "Complete restaurant POS solution with table management and kitchen display integration.",
    category: "Software",
    stock: 999,
    sku: "ATACC-REST",
    brand_logo: "atACC",
  },

  {
    id: 39,
    discountPct: 14,
    slug: "cctv-kit-8-channel",
    name: "SecureVision 8 Channel CCTV Kit",
    brand: "SecureVision",
    price: 1299,
    originalPrice: 1499,
    isNew: false,
    isBestSeller: true,
    rating: 4.7,
    reviews: 261,
    colors: [{ name: "White", hex: "#F8FAFC" }],
    sizes: ["8 Camera Kit"],
    badge: "SURVEILLANCE",
    badgeColor: "#DC2626",
    images: productImages("cctv-kit-8-channel"),
    tags: ["1080P", "Night Vision", "NVR"],
    description: "Commercial CCTV surveillance kit for retail stores and warehouses.",
    category: "Security",
    stock: 11,
    sku: "SV-CCTV8",
    brand_logo: "SecureVision",
  },

  {
    id: 40,
    discountPct: 16,
    slug: "synology-ds223-nas",
    name: "Synology DS223 NAS Storage",
    brand: "Synology",
    price: 1199,
    originalPrice: 1429,
    isNew: true,
    isBestSeller: false,
    rating: 4.9,
    reviews: 173,
    colors: [{ name: "Black", hex: "#111827" }],
    sizes: ["2 Bay"],
    badge: "STORAGE",
    badgeColor: "#1E40AF",
    images: productImages("synology-ds223-nas"),
    tags: ["Backup", "Cloud", "RAID"],
    description: "Network-attached storage solution for ERP backups and business data protection.",
    category: "Storage",
    stock: 16,
    sku: "SYN-DS223",
    brand_logo: "Synology",
  },

  {
    id: 41,
    discountPct: 11,
    slug: "partnertech-cd7220-display",
    name: "PartnerTech CD7220 Customer Display",
    brand: "PartnerTech",
    price: 329,
    originalPrice: 369,
    isNew: false,
    isBestSeller: false,
    rating: 4.6,
    reviews: 119,
    colors: [{ name: "Black", hex: "#111827" }],
    sizes: ["2x20 VFD"],
    badge: "DISPLAY",
    badgeColor: "#0891B2",
    images: productImages("partnertech-cd7220-display"),
    tags: ["USB", "VFD", "Arabic"],
    description: "Professional customer-facing display for retail billing counters.",
    category: "Displays",
    stock: 29,
    sku: "PT-CD7220",
    brand_logo: "PartnerTech",
  },

  {
    id: 42,
    discountPct: 13,
    slug: "star-micronics-mc-print3",
    name: "Star Micronics mC-Print3",
    brand: "Star",
    price: 799,
    originalPrice: 919,
    isNew: true,
    isBestSeller: true,
    rating: 4.8,
    reviews: 344,
    colors: [{ name: "White", hex: "#F8FAFC" }],
    sizes: ["80mm"],
    badge: "PREMIUM",
    badgeColor: "#A16207",
    images: productImages("star-micronics-mc-print3"),
    tags: ["Cloud Printing", "Bluetooth", "USB-C"],
    description: "Modern cloud-ready receipt printer supporting retail and hospitality businesses.",
    category: "Printers",
    stock: 31,
    sku: "STAR-MCP3",
    brand_logo: "Star",
  }
];

// ─── IMAGE HELPERS (local assets — external CDNs blocked in production) ─────

const CATEGORY_ASSET: Record<string, string> = {
  "Label Printers": categoryImage("printers"),
  "Mobile Computers": categoryImage("laptops"),
  Scanners: categoryImage("scanners"),
  Security: categoryImage("cctv"),
  "Power Solutions": categoryImage("ups"),
  Software: categoryImage("software"),
  Storage: categoryImage("servers"),
  Displays: categoryImage("displays"),
  Printers: categoryImage("printers"),
  "POS Systems": categoryImage("pos"),
};

export const assetForCategory = (category?: string) =>
  CATEGORY_ASSET[category ?? ""] ?? categoryImage("pos");

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  { name: "POS Systems", count: 45, img: "pos-systems", color: "#166534", shopCategory: "POS Systems" },
  { name: "Printers", count: 32, img: "printers-grid", color: "#15803D", shopCategory: "Printers" },
  { name: "Scanners", count: 28, img: "scanners-grid", color: "#16A34A", shopCategory: "Scanners" },
  { name: "Displays", count: 19, img: "displays-grid", color: "#0D3B2E", shopCategory: "Displays" },
  { name: "Software & ERP", count: 12, img: "software", color: "#15803D", shopCategory: "Software" },
  { name: "Security & CCTV", count: 23, img: "security", color: "#166534", shopCategory: "Security" },
  { name: "Servers & Storage", count: 18, img: "servers", color: "#111827", shopCategory: "Storage" },
  { name: "Networking", count: 27, img: "networking", color: "#6B7280" },
  { name: "Laptops & PCs", count: 34, img: "laptops", color: "#0D3B2E", shopCategory: "Mobile Computers" },
  { name: "UPS & Power", count: 15, img: "ups", color: "#16A34A", shopCategory: "Power Solutions" },
  { name: "Label Printers", count: 21, img: "printers", color: "#15803D", shopCategory: "Label Printers" },
  { name: "Mobile Computers", count: 16, img: "scanners-grid", color: "#166534", shopCategory: "Mobile Computers" },
];

export const HERO_CATEGORY_STRIP = [
  { label: "CCTV & Security", img: categoryImage("cctv"), shopCategory: "Security" },
  { label: "Networking", img: categoryImage("networking"), shopCategory: "Networking" },
  { label: "POS Systems", img: categoryImage("pos"), shopCategory: "POS Systems" },
  { label: "Computers", img: categoryImage("laptops"), shopCategory: "Mobile Computers" },
  { label: "Printers", img: categoryImage("printers"), shopCategory: "Printers" },
  { label: "Scanners", img: categoryImage("scanners"), shopCategory: "Scanners" },
  { label: "Software & ERP", img: categoryImage("software"), shopCategory: "Software" },
  { label: "Displays", img: categoryImage("displays"), shopCategory: "Displays" },
  { label: "Servers & Storage", img: categoryImage("servers"), shopCategory: "Storage" },
  { label: "Access Control", img: categoryImage("security"), shopCategory: "Security" },
  { label: "UPS & Power", img: categoryImage("ups"), shopCategory: "Power Solutions" },
  { label: "Mobile Computers", img: categoryImage("scanners-grid"), shopCategory: "Mobile Computers" },
];

export const HERO_SLIDER_SLIDES = [
  {
    id: 1,
    eyebrow: "MEGA SALE",
    title: "Dell PowerEdge\nR760 Server",
    sub: "2nd Gen Intel Xeon. NVMe-ready. Built for Qatar's enterprise.",
    note: "*Incl. VAT & All Offers",
    cta: "Shop Now",
    img: heroImage("slide-1"),
  },
  {
    id: 2,
    eyebrow: "FLASH SALE — ENDING SOON",
    title: "Cisco Catalyst\n9300 Series",
    sub: "Enterprise switching with full PoE and advanced security.",
    note: "*Cisco Gold Partner in Qatar",
    cta: "Shop Now",
    img: heroImage("slide-2"),
  },
  {
    id: 3,
    eyebrow: "BEST SELLER",
    title: "HP EliteBook\n840 G11",
    sub: "Business ultrabook with AI-powered performance. QAR 2,199 onwards.",
    note: "*Bulk pricing for corporates",
    cta: "Shop Now",
    img: heroImage("slide-3"),
  },
  {
    id: 4,
    eyebrow: "SECURITY WEEK",
    title: "Hikvision 4K\nCCTV Kits",
    sub: "Complete surveillance packages with NVR. Installation across Doha.",
    note: "*Kits starting QAR 599",
    cta: "Shop Now",
    img: heroImage("slide-4"),
  },
];

export const FLASH_OFFERS = [
  {
    tag: "HOT DEAL",
    title: "UP TO 40% OFF",
    subtitle: "Networking & Switches",
    highlight: "Cisco • TP-Link • Ubiquiti",
    price: "QAR 299",
    oldPrice: "QAR 499",
    cta: "Grab Deal",
    img: categoryImage("networking"),
  },
  {
    tag: "FLASH SALE",
    title: "APC UPS",
    subtitle: "Reliable Power Backup",
    highlight: "Starting from",
    price: "QAR 399",
    oldPrice: "",
    cta: "Shop Now",
    img: categoryImage("ups"),
  },
];

export const HARDWARE_SHOWCASE = {
  eyebrow: "Featured Deal",
  title: "Touch POS System",
  description: "All-in-one POS hardware for retail & hospitality — built to run all day.",
  img: productImage("atacc-restaurant-pos"),
  shopCategory: "POS Systems",
  cta: "Shop POS Systems",
  offer: "Up to 25% OFF",
  price: "QAR 1,499",
  oldPrice: "QAR 1,999",
};

/** @deprecated use HARDWARE_SHOWCASE */
export const HOME_POS_BANNER = {
  ...HARDWARE_SHOWCASE,
};

// ─── HERO SLIDES (legacy export) ─────────────────────────────────────────────
// export const HERO_SLIDES: HeroSlide[] = [
//   // {
//   //   id: 1,
//   //   eyebrow: "QATAR'S #1 POS SOLUTIONS",
//   //   title: "Smarter POS.\nBetter Business.",
//   //   accent: "Built for Qatar.",
//   //   desc: "From single-store retail to enterprise chains — complete POS hardware, software, and ERP integration. All Qatar VAT compliant.",
//   //   cta: "Shop POS Systems",
//   //   cta2: "View All Products",
//   //   img: categoryImage("pos"),
//   //   // accent2: categoryImage("pos"),
//   // },
//   {
//     id: 1,
//     eyebrow: "QATAR'S #1 INVENTORY SOLUTIONS",
//     title: "Smarter Inventory.\nBetter Business.",
//     accent: "Built for Qatar.",
//     desc: "Manage stock with confidence using intelligent inventory solutions for retail, wholesale, warehouses, and enterprise businesses. Real-time tracking, barcode support, and Qatar VAT compliant.",
//     cta: "Shop Inventory Solutions",
//     cta2: "Explore Inventory Products",
//     // img: categoryImage("pos"),
//     img: "https://www.logicerp.com/blog/wp-content/uploads/2026/01/Blog-Banner-95.jpg",
//     // accent2: categoryImage("pos"),
//   },
//   {
//     id: 2,
//     eyebrow: "atACC ERP SOFTWARE",
//     title: "Complete Retail\nERP Solution.",
//     accent: "VAT Ready.",
//     desc: "Qatar VAT-compliant accounting, inventory, POS & CRM in one platform. Trusted by 1,300+ businesses in Doha.",
//     cta: "Explore atACC ERP",
//     cta2: "Book Free Demo",
//     img: categoryImage("pos"),
//     // accent2: categoryImage("pos"),
//   },
//   {
//     id: 3,
//     eyebrow: "RESTAURANT & HOSPITALITY",
//     title: "POS Built for\nRestaurants.",
//     accent: "Zero Downtime.",
//     desc: "Kitchen display, table management, and multi-branch sync. Tested in 200+ Doha restaurants.",
//     cta: "Shop Restaurant POS",
//     cta2: "See Features",
//     img: categoryImage("pos"),
//     // accent2: categoryImage("pos"),
//   },
// ];
/** @deprecated Use HERO_SLIDER_SLIDES */
export const HERO_SLIDES = HERO_SLIDER_SLIDES;

// ─── NAV MENUS ───────────────────────────────────────────────────────────────
export const NAV_MENUS: Record<string, NavMenu> = {
  Products: {
    featured: ["New Arrivals", "Bestsellers", "POS Bundles", "Software Deals"],
    shoes: ["POS Systems", "Printers", "Scanners", "Cash Drawers", "Displays", "Software", "Networking"],
    favorites: ["atACC POS Pro 15\"", "ThermalJet Printer", "atACC Software", "KDS Display"],
    apparel: ["Training Services", "Installation", "Annual Maintenance"],
    imgs: [
      { url: categoryImage("pos"), label: "POS Pro 15\"", price: "QAR 2,899" },
      { url: categoryImage("software"), label: "atACC ERP", price: "QAR 799" },
    ],
  },
  Solutions: {
    featured: ["Retail POS", "Restaurant POS", "Pharmacy POS", "Supermarket POS"],
    shoes: ["Healthcare", "Education", "Hospitality", "Logistics", "Service Centers"],
    favorites: ["atACC ERP", "atACC HR", "atACC CRM", "Cloud ERP"],
    apparel: ["Consulting", "Implementation", "Support"],
    imgs: [
      { url: categoryImage("pos"), label: "Restaurant POS", price: "QAR 1,799" },
      { url: categoryImage("displays"), label: "KDS Display", price: "QAR 1,299" },
    ],
  },
  Deals: {
    featured: ["Clearance Sale", "Bundle Deals"],
    shoes: ["POS Bundles", "Software + Hardware"],
    favorites: [],
    apparel: ["Service Contracts"],
    imgs: [
      { url: categoryImage("pos"), label: "POS Bundle", price: "From QAR 999" },
      { url: categoryImage("printers"), label: "Printer Deals", price: "Up to 20% off" },
    ],
  },
};

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1, name: "Ahmed Al-Mansoori", role: "Owner, Tamim Supermarket", rating: 5,
    text: "Skynet installed the full POS system with atACC ERP across all 3 of our branches in Doha. Zero downtime, perfect VAT reporting. Their support team is available 24/7.",
    product: "atACC POS Pro 15\"",
  },
  {
    id: 2, name: "Priya Nair", role: "Finance Manager, Al Rawabi Group", rating: 5,
    text: "The atACC ERP handles our entire accounting workflow — from invoicing to VAT filing to inventory. We processed QAR 2.4M in sales last month with zero issues.",
    product: "atACC ERP Software",
  },
  {
    id: 3, name: "Mohammed Al-Thani", role: "Operations Head, Lusail Mall Branch", rating: 5,
    text: "The restaurant POS with KDS integration transformed our kitchen workflow. Orders go from POS to kitchen in real-time. Wait times dropped by 30%.",
    product: "KitchenView KDS 15\"",
  },
];

// ─── REVIEWS ─────────────────────────────────────────────────────────────────
export const REVIEWS: Review[] = [
  {
    id: 1, productId: 38, name: "Ahmed Al-Mansoori", location: "Doha, Qatar", rating: 5,
    title: "Best POS system we've used", date: "Jan 15, 2025", variant: "Space Black · 15\"",
    text: "Installed across 3 locations. The 15\" touch screen is super responsive, and atACC integration was plug-and-play. VAT reports are automatic.",
    helpful: 84, verified: true,
  },
  {
    id: 2, productId: 38, name: "Kaveh S.", location: "West Bay, Qatar", rating: 5,
    title: "Fanless and silent — perfect for quiet cafes", date: "Dec 28, 2024", variant: "Silver · 15\"",
    text: "The fanless design is a game-changer for our upscale cafe. No noise, no overheating after 12-hour days, and the display looks premium on our counter.",
    helpful: 62, verified: true,
  },
  {
    id: 3, productId: 38, name: "Layla M.", location: "Al Wakra, Qatar", rating: 4,
    title: "Great hardware, setup took time", date: "Nov 30, 2024", variant: "Space Black · 15\"",
    text: "The hardware is excellent quality. Initial atACC configuration took a day with Skynet's tech team, but since then it has been flawless.",
    helpful: 41, verified: true,
  },
  {
    id: 4, productId: 42, name: "Sarah K.", location: "The Pearl, Qatar", rating: 5,
    title: "300mm/s is blazing fast", date: "Jan 2, 2025", variant: "White · 80mm",
    text: "We print 400+ receipts daily. Zero jams in 3 months. Auto-cut is smooth and the Wi-Fi connection has been rock solid throughout.",
    helpful: 98, verified: true,
  },
  {
    id: 5, productId: 38, name: "Rajesh P.", location: "Lusail, Qatar", rating: 5,
    title: "Best ERP for Qatar SMEs", date: "Jan 10, 2025", variant: "1 Store License",
    text: "We switched from a manual system to atACC ERP 6 months ago. VAT filing takes 10 minutes instead of 2 days. Cloud backup is automatic. Worth every riyal.",
    helpful: 234, verified: true,
  },
  {
    id: 6, productId: 33, name: "Fatima H.", location: "Doha, Qatar", rating: 5,
    title: "Reliable label printing for warehouse", date: "Dec 15, 2024", variant: "4 Inch · USB",
    text: "Runs 10+ hours daily in our warehouse. Labels are crisp at 203 DPI and setup with Skynet was same-day. Support answered every question quickly.",
    helpful: 187, verified: true,
  },
];

// ─── SHOP HELPERS ────────────────────────────────────────────────────────────
export const PRICE_MAX = 3500;

export const SHOP_CATEGORIES = [
  ...CATEGORIES.map(c => c.name),
  ...Array.from(new Set(PRODUCTS.map(p => p.category).filter(Boolean) as string[])).filter(
    n => !CATEGORIES.some(c => c.name === n)
  ),
];

export const getCategoryCount = (name: string): number =>
  PRODUCTS.filter(p => p.category === name).length;

/** Catalog count for grid cards — uses live product count when available */
export const getCategoryDisplayCount = (cat: Category): number => {
  const key = cat.shopCategory ?? cat.name;
  const live = getCategoryCount(key);
  return live > 0 ? live : cat.count;
};

// ─── FORMAT CURRENCY ─────────────────────────────────────────────────────────
export const fmt = (n: number): string =>
  `QAR ${n.toLocaleString("en-QA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
