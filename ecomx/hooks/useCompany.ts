"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companyApi, fetchCompany } from "@/lib/api/company.api";
import { defaultCompanyFormValues } from "@/lib/admin/company-form";
import type { ApiCompany, UpdateCompanyPayload } from "@/types/company.types";

export const COMPANY_KEY = "company";

function fallbackCompany(): ApiCompany {
  const v = defaultCompanyFormValues;
  return {
    nameEn: v.nameEn,
    nameAr: v.nameAr,
    taglineEn: v.taglineEn,
    taglineAr: v.taglineAr,
    addressEn: v.addressEn,
    addressAr: v.addressAr,
    phone: v.phone,
    whatsapp: v.whatsapp,
    email: v.email,
    website: v.website,
    logo: v.logo,
    primaryColor: v.primaryColor,
    clientUrl: v.clientUrl,
    domains: [],
  };
}

export function useCompany(enabled = true) {
  return useQuery({
    queryKey: [COMPANY_KEY],
    queryFn: async () => {
      try {
        return await fetchCompany();
      } catch {
        return fallbackCompany();
      }
    },
    enabled,
    staleTime: 300_000,
    retry: false,
  });
}

export function useCompanyMutations() {
  const queryClient = useQueryClient();

  const update = useMutation({
    mutationFn: (payload: UpdateCompanyPayload) => companyApi.update(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [COMPANY_KEY] });
    },
  });

  return { update };
}
