"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import ViewSection from "@/components/admin/utils/ViewSection";
import ViewField from "@/components/admin/utils/ViewField";
import TenantAdminGuard from "@/components/admin/tenants/TenantAdminGuard";
import { useTenantBySlug, useTenantMutations } from "@/hooks/useTenants";
import { useTenantAccess } from "@/hooks/useTenantAccess";
import { adminType } from "@/lib/admin/typography";
import { ADMIN_ROUTES } from "@/lib/config";
import { formatDate, getErrorMessage } from "@/lib/utils";

export default function AdminTenantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { canView, canUpdate, canDelete } = useTenantAccess();
  const { data: tenant, isLoading, isError } = useTenantBySlug(slug, canView);
  const { remove } = useTenantMutations();

  const handleDelete = async () => {
    if (!tenant) return;
    try {
      await remove.mutateAsync(tenant._id);
      toast.success("Store deleted");
      router.push(ADMIN_ROUTES.tenants);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete store"));
    }
  };

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
          editPath={canUpdate ? ADMIN_ROUTES.tenantEdit(tenant.slug) : undefined}
          deleteItemName={canDelete ? tenant.name : undefined}
          onDelete={canDelete ? handleDelete : undefined}
          deleting={remove.isPending}
        >
          <div className="space-y-6">
            <ViewSection id="identity" title="Identity">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <ViewField label="Name" value={tenant.name} />
                <ViewField label="Slug" value={tenant.slug} />
              </div>
            </ViewSection>

            <ViewSection id="config" title="Configuration">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <ViewField label="Zone" value={tenant.zone.replace(/_/g, " ")} />
                <ViewField label="Department" value={tenant.department} capitalize />
                <ViewField label="Currency" value={tenant.currency} />
                <ViewField label="Payment" value={tenant.paymentGateway} capitalize />
              </div>
            </ViewSection>

            <ViewSection id="branding" title="Branding">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <ViewField label="Logo" value={tenant.logo} />
                <ViewField label="Primary Color" value={tenant.theme?.primaryColor} />
              </div>
            </ViewSection>

            <ViewSection id="settings" title="Settings">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <ViewField label="Tax %" value={tenant.settings?.taxPercent ?? 0} />
                <ViewField label="Free Ship Above" value={tenant.settings?.freeShippingAbove ?? "—"} />
                <ViewField label="Support Email" value={tenant.settings?.supportEmail} />
                <ViewField
                  label="Active"
                  value={tenant.isActive !== false ? "Yes" : "No"}
                  badge
                  badgeColor={tenant.isActive !== false ? "green" : "gray"}
                />
                <ViewField
                  label="Created"
                  value={tenant.createdAt ? formatDate(tenant.createdAt) : "—"}
                />
              </div>
            </ViewSection>
          </div>
        </BackPanel>
      )}
    </TenantAdminGuard>
  );
}
