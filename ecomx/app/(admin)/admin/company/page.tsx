"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import CompanyForm from "@/components/admin/company/CompanyForm";
import { companyFormFooterButtons } from "@/lib/admin/form-footer";
import { useCompany, useCompanyMutations } from "@/hooks/useCompany";
import { adminType } from "@/lib/admin/typography";
import { getErrorMessage } from "@/lib/utils";

export default function AdminCompanyPage() {
  const router = useRouter();
  const { data: company, isLoading } = useCompany();
  const { update } = useCompanyMutations();

  if (isLoading) {
    return (
      <BackPanel>
        <p className={adminType.loading}>Loading company profile...</p>
      </BackPanel>
    );
  }

  return (
    <BackPanel
      buttons={companyFormFooterButtons({
        isEdit: true,
        isPending: update.isPending,
        onCancel: () => router.back(),
      })}
    >
      <CompanyForm
        initialCompany={company}
        isPending={update.isPending}
        onSubmit={async (payload) => {
          try {
            await update.mutateAsync(payload);
            toast.success("Company profile updated");
          } catch (err) {
            toast.error(getErrorMessage(err, "Failed to update company profile"));
          }
        }}
      />
    </BackPanel>
  );
}
