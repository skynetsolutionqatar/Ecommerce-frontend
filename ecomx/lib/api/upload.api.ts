import apiClient from "./client";
import type { ApiResponse } from "@/types/api.types";

export interface UploadedImage {
  url: string;
  publicId: string;
}

async function uploadForm<T>(url: string, form: FormData): Promise<T> {
  const { data } = await apiClient.post<ApiResponse<T>>(url, form);
  return data.data;
}

export const uploadApi = {
  /** Upload 1–5 product images — field name: `images` */
  productImages: async (files: File[]): Promise<UploadedImage[]> => {
    const form = new FormData();
    files.forEach((file) => form.append("images", file));
    const data = await uploadForm<{ images: UploadedImage[] }>("/upload/products", form);
    return data.images;
  },

  /** Upload single category image — field name: `image` */
  categoryImage: async (file: File): Promise<UploadedImage> => {
    const form = new FormData();
    form.append("image", file);
    const data = await uploadForm<{ image: UploadedImage }>("/upload/category", form);
    return data.image;
  },

  /** Upload customer avatar — field name: `avatar` */
  avatar: async (file: File): Promise<UploadedImage> => {
    const form = new FormData();
    form.append("avatar", file);
    const data = await uploadForm<{ image: UploadedImage }>("/upload/avatar", form);
    return data.image;
  },

  /** Upload 1–3 review images — field name: `images` */
  reviewImages: async (files: File[]): Promise<UploadedImage[]> => {
    const form = new FormData();
    files.forEach((file) => form.append("images", file));
    const data = await uploadForm<{ images: UploadedImage[] }>("/upload/reviews", form);
    return data.images;
  },

  /** Upload banner/hero image — field name: `banner` */
  banner: async (file: File): Promise<UploadedImage> => {
    const form = new FormData();
    form.append("banner", file);
    const data = await uploadForm<{ image: UploadedImage }>("/upload/banner", form);
    return data.image;
  },

  /** Delete image from Cloudinary */
  delete: async (publicId: string): Promise<void> => {
    await apiClient.delete("/upload", { data: { publicId } });
  },
};
