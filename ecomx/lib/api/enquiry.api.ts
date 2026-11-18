import { apiPost } from "./client";

export interface CreateEnquiryPayload {
  productId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  users?: number;
  message?: string;
  /** Honeypot — must stay empty for real users */
  website?: string;
}

export const enquiryApi = {
  create: (payload: CreateEnquiryPayload) =>
    apiPost<{ id: string | null }>("/enquiries", payload),
};
