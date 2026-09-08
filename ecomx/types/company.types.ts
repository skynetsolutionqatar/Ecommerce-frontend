import type { InvoiceCompany } from "@/types/invoice.types";

export interface ApiCompany extends InvoiceCompany {
  _id?: string;
  updatedAt?: string;
}

export type UpdateCompanyPayload = Partial<InvoiceCompany>;
