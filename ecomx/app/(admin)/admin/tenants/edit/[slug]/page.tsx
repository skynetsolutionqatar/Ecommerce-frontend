"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import TenantForm from "@/components/admin/tenants/TenantForm";
import TenantAdminGuard from "@/components/admin/tenants/TenantAdminGuard";
import { tenantFormFooterButtons } from "@/lib/admin/form-footer";
import { ADMIN_ROUTES } from "@/lib/config";
import { useTenantBySlug, useTenantMutations } from "@/hooks/useTenants";
import { useTenantAccess } from "@/hooks/useTenantAccess";
import { adminType } from "@/lib/admin/typography";
import { getErrorMessage } from "@/lib/utils";
import type { UpdateTenantPayload } from "@/types/tenant.types";

export default function AdminTenantEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { canUpdate } = useTenantAccess();
  const { data: tenant, isLoading, isError } = useTenantBySlug(slug, canUpdate);
  const { update } = useTenantMutations();

  return (
    <TenantAdminGuard>
      {isLoading ? (
        <BackPanel>
          <p className={adminType.loading}>Loading store...</p>
        </BackPanel>
      ) : isError || !tenant ? (
        <BackPanel>
          <p className={adminType.error}>Store not found or access denied.</p>
        </BackPanel>
      ) : (
        <BackPanel
          buttons={tenantFormFooterButtons({
            isEdit: true,
            isPending: update.isPending,
            onCancel: () => router.back(),
          })}
        >
          <TenantForm
            isEdit
            initialTenant={tenant}
            isPending={update.isPending}
            onSubmit={async (payload) => {
              try {
                await update.mutateAsync({ id: tenant._id, payload: payload as UpdateTenantPayload });
                toast.success("Store updated");
                router.push(ADMIN_ROUTES.tenant(tenant.slug));
              } catch (err) {
                toast.error(getErrorMessage(err, "Failed to update store"));
              }
            }}
          />
        </BackPanel>
      )}
    </TenantAdminGuard>
  );
}
