"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import DeliverySettingsForm, {
  DELIVERY_FORM_ID,
} from "@/components/admin/delivery/DeliverySettingsForm";
import { useAdminDeliverySettings, useDeliverySettingsMutations } from "@/hooks/useDeliverySettings";
import { adminType } from "@/lib/admin/typography";
import { getErrorMessage } from "@/lib/utils";
import { createFormFooterButtons } from "@/lib/admin/form-footer";

export default function AdminDeliverySettingsPage() {
  const router = useRouter();
  const { data, isLoading } = useAdminDeliverySettings();
  const { update } = useDeliverySettingsMutations();

  if (isLoading) {
    return (
      <BackPanel>
        <p className={adminType.loading}>Loading delivery settings...</p>
      </BackPanel>
    );
  }

  return (
    <BackPanel
      buttons={createFormFooterButtons({
        formId: DELIVERY_FORM_ID,
        entityLabel: "Delivery settings",
        isEdit: true,
        isPending: update.isPending,
        onCancel: () => router.back(),
      })}
    >
      <DeliverySettingsForm
        initial={data}
        isPending={update.isPending}
        onSubmit={async (payload) => {
          try {
            await update.mutateAsync(payload);
            toast.success("Delivery settings saved");
          } catch (err) {
            toast.error(getErrorMessage(err, "Failed to save delivery settings"));
          }
        }}
      />
    </BackPanel>
  );
}
