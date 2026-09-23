export type ApiContentPage = {
  _id: string;
  slug: string;
  title: string;
  titleAr?: string;
  body: string;
  bodyAr?: string;
  footerLabel?: string;
  showInFooter: boolean;
  displayOrder: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ContentPageQuery = {
  search?: string;
  footer?: boolean | "true";
  isPublished?: boolean | "true" | "false" | "all";
  page?: number;
  limit?: number;
  sortBy?: "displayOrder" | "title" | "createdAt";
  sortOrder?: "asc" | "desc";
};

export type CreateContentPagePayload = {
  slug: string;
  title: string;
  titleAr?: string;
  body?: string;
  bodyAr?: string;
  footerLabel?: string;
  showInFooter?: boolean;
  displayOrder?: number;
  isPublished?: boolean;
};

export type UpdateContentPagePayload = Partial<CreateContentPagePayload>;
