"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import TenantForm from "@/components/admin/tenants/TenantForm";
import TenantAdminGuard from "@/components/admin/tenants/TenantAdminGuard";
import { tenantFormFooterButtons } from "@/lib/admin/form-footer";
import { ADMIN_ROUTES } from "@/lib/config";
import { useTenantMutations } from "@/hooks/useTenants";
import { getErrorMessage } from "@/lib/utils";
import type { CreateTenantPayload } from "@/types/tenant.types";

export default function AdminTenantAddPage() {
  const router = useRouter();
  const { create } = useTenantMutations();

  return (
    <TenantAdminGuard>
      <BackPanel
        buttons={tenantFormFooterButtons({
          isPending: create.isPending,
          onCancel: () => router.back(),
        })}
      >
        <TenantForm
          isPending={create.isPending}
          onSubmit={async (payload) => {
            try {
              await create.mutateAsync(payload as CreateTenantPayload);
              toast.success("Store created");
              router.push(ADMIN_ROUTES.tenants);
            } catch (err) {
              toast.error(getErrorMessage(err, "Failed to create store"));
            }
          }}
        />
      </BackPanel>
    </TenantAdminGuard>
  );
}
