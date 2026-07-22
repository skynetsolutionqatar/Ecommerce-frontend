"use client";

import { use } from "react";
import BackPanel from "@/components/admin/utils/BackPanel";
import ViewSection from "@/components/admin/utils/ViewSection";
import ViewField from "@/components/admin/utils/ViewField";
import { adminType } from "@/lib/admin/typography";
import { useCustomer, useCustomerMutations } from "@/hooks/useCustomers";
import { formatDate } from "@/lib/utils";

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "addresses", label: "Addresses" },
];

export default function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: customer, isLoading, isError } = useCustomer(id);
  const { toggleStatus } = useCustomerMutations();

  if (isLoading) {
    return (
      <BackPanel>
        <p className={adminType.loading}>Loading customer...</p>
      </BackPanel>
    );
  }

  if (isError || !customer) {
    return (
      <BackPanel>
        <p className={adminType.error}>Customer not found.</p>
      </BackPanel>
    );
  }

  return (
    <BackPanel tabs={TABS}>
      <div className="space-y-6">
        <ViewSection id="profile" title="Profile">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField label="Name" value={customer.name} />
            <ViewField label="Email" value={customer.email} />
            <ViewField label="Phone" value={customer.phone || "—"} />
            <ViewField label="Role" value={customer.role} />
            <ViewField
              label="Status"
              value={customer.isActive ? "Active" : "Inactive"}
              badge
              badgeColor={customer.isActive ? "green" : "gray"}
            />
            <ViewField
              label="Email verified"
              value={customer.isEmailVerified ? "Yes" : "No"}
            />
            <ViewField
              label="Joined"
              value={customer.createdAt ? formatDate(customer.createdAt) : "—"}
            />
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => void toggleStatus.mutateAsync(customer._id)}
              disabled={toggleStatus.isPending}
              className="rounded-md border px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
            >
              {toggleStatus.isPending
                ? "Updating..."
                : customer.isActive
                  ? "Deactivate customer"
                  : "Activate customer"}
            </button>
          </div>
        </ViewSection>

        <ViewSection id="addresses" title="Saved Addresses">
          {(customer.addresses ?? []).length > 0 ? (
            <div className="space-y-4">
              {customer.addresses!.map((address, index) => (
                <div key={address._id ?? index} className="rounded-lg border p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ViewField label="Name" value={address.fullName} />
                    <ViewField label="Phone" value={address.phone} />
                    <ViewField label="Address" value={address.line1} />
                    <ViewField label="City" value={address.city} />
                    <ViewField label="Country" value={address.country} />
                    <ViewField label="Default" value={address.isDefault ? "Yes" : "No"} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No saved addresses</p>
          )}
        </ViewSection>
      </div>
    </BackPanel>
  );
}
