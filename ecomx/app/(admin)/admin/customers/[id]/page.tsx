"use client";

import { use } from "react";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import ViewSection from "@/components/admin/utils/ViewSection";
import ViewField from "@/components/admin/utils/ViewField";
import CustomerForm from "@/components/admin/customers/CustomerForm";
import { customerDetailFooterButtons } from "@/lib/admin/form-footer";
import { adminType } from "@/lib/admin/typography";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useCustomer, useCustomerMutations } from "@/hooks/useCustomers";

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "access", label: "Access" },
  { key: "addresses", label: "Addresses" },
];

export default function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: customer, isLoading, isError } = useCustomer(id);
  const { toggleStatus, update } = useCustomerMutations();

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
    <BackPanel
      tabs={TABS}
      buttons={customerDetailFooterButtons({
        isPending: update.isPending,
        togglePending: toggleStatus.isPending,
        isActive: customer.isActive,
        onToggleStatus: () => {
          void toggleStatus.mutateAsync(customer._id).then(
            () => toast.success(customer.isActive ? "Customer deactivated" : "Customer activated"),
            (err) => toast.error(getApiErrorMessage(err, "Could not update customer status"))
          );
        },
      })}
    >
      <div className="space-y-6">
        <CustomerForm
          customer={customer}
          isPending={update.isPending}
          onSubmit={async (payload) => {
            try {
              await update.mutateAsync({ id: customer._id, payload });
              toast.success("Customer updated");
            } catch (err) {
              toast.error(getApiErrorMessage(err, "Could not update customer"));
            }
          }}
        />

        <ViewSection id="addresses" title="Saved Addresses">
          {(customer.addresses ?? []).length > 0 ? (
            <div className="space-y-4">
              {customer.addresses!.map((address, index) => (
                <div key={address._id ?? index} className="rounded-lg border border-border p-4">
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
            <p className="text-sm text-muted-foreground">No saved addresses</p>
          )}
        </ViewSection>
      </div>
    </BackPanel>
  );
}
