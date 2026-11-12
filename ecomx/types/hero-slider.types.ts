export interface ApiHeroSlider {
  _id: string;
  slug: string;
  offerLabel?: string;
  /** @deprecated legacy rows only */
  slideKind?: string;
  eyebrow: string;
  title: string;
  sub: string;
  note: string;
  cta: string;
  img: string;
  posterImg?: string;
  posterImgMobile?: string;
  isPoster?: boolean;
  productSlug?: string;
  price?: number;
  compareAtPrice?: number;
  discount?: number;
  surfaceColor?: string;
  accentColor?: string;
  accentNeon?: string;
  displayOrder: number;
  isPublished: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type HeroSliderArchiveFilter = "active" | "archived" | "all";

export interface HeroSliderQuery {
  page?: number;
  limit?: number;
  search?: string;
  isPublished?: boolean;
  archive?: HeroSliderArchiveFilter;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateHeroSliderPayload {
  slug?: string;
  offerLabel?: string;
  eyebrow?: string;
  title: string;
  sub?: string;
  note?: string;
  cta?: string;
  img?: string;
  posterImg?: string;
  posterImgMobile?: string;
  isPoster?: boolean;
  productSlug?: string;
  price?: number;
  compareAtPrice?: number;
  discount?: number;
  surfaceColor?: string;
  accentColor?: string;
  accentNeon?: string;
  displayOrder?: number;
  isPublished?: boolean;
  isArchived?: boolean;
}

export type UpdateHeroSliderPayload = Partial<CreateHeroSliderPayload>;
