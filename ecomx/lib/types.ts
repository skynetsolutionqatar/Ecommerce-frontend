export interface StoreUser {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Review {
  id: number;
  productId: number;
  name: string;
  location: string;
  rating: number;
  title: string;
  text: string;
  date: string;
  variant: string;
  helpful: number;
  verified: boolean;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  ratings: string[];
  colors: string[];
  sizes: string[];
  tags: string[];
}

export type SortOption = "relevance" | "price-asc" | "price-desc" | "rating" | "newest" | "bestseller";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  isNew: boolean;
  isBestSeller: boolean;
  rating: number;
  reviews: number;
  colors: ProductColor[];
  sizes: string[];
  badge: string;
  badgeColor: string;
  images: string[];
  tags: string[];
  description: string;
  category?: string;
  stock?: number;
  sku?: string;
  brand_logo?: string;
  discountPct:number
}


export interface CartItem {
  id: string; // unique: productId + color + size
  productId: number;
  name: string;
  brand: string;
  price: number;
  img: string;
  color?: string;
  size?: string;
  qty: number;
}

export interface WishlistItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  img: string;
}

export interface Category {
  name: string;
  count: number;
  img: string;
  color: string;
  /** Shop filter category when different from display name */
  shopCategory?: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  rating: number;
  text: string;
  product: string;
}

export interface HeroSlide {
  id: number;
  eyebrow: string;
  title: string;
  accent: string;
  desc: string;
  cta: string;
  cta2: string;
  img: string;
  tag?: string;
  badge?: string;
  accentColor?: string;
  bg?: string;
  headline:string
  sub:string
  // accent2: string;
}

export interface NavMenu {
  featured: string[];
  shoes: string[];
  favorites: string[];
  apparel: string[];
  imgs: { url: string; label: string; price: string }[];
}
