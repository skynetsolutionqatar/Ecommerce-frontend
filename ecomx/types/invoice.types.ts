import type { ApiOrder } from "@/types/order.types";

export interface InvoiceTerm {
  en: string;
  ar: string;
}

export interface InvoiceCompany {
  nameEn: string;
  nameAr: string;
  taglineEn: string;
  taglineAr: string;
  addressEn: string;
  addressAr: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
}

export interface InvoiceBank {
  name: string;
  beneficiary: string;
  account: string;
  iban: string;
  swift: string;
  currency: string;
}

export interface InvoiceTerms {
  warranty: string;
  sales: InvoiceTerm[];
  payment: InvoiceTerm[];
  delivery: InvoiceTerm[];
}

export interface InvoicePayload {
  order: ApiOrder;
  invoiceNumber: string;
  filename: string;
  currency: string;
  company: InvoiceCompany;
  bank: InvoiceBank;
  terms: InvoiceTerms;
  logoUrl: string;
  bannerBgUrl: string;
  qrDataUrl?: string;
}
