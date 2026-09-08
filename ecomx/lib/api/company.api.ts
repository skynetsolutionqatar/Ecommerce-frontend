import { apiGet, apiPatch } from "./client";
import type { ApiCompany, UpdateCompanyPayload } from "@/types/company.types";

export const companyApi = {
  get: () => apiGet<{ company: ApiCompany }>("/company"),

  update: (payload: UpdateCompanyPayload) =>
    apiPatch<{ company: ApiCompany }>("/company", payload),
};

export async function fetchCompany(): Promise<ApiCompany> {
  const res = await companyApi.get();
  return res.data.company;
}
