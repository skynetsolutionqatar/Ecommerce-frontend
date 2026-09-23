"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import FixedContentPageForm from "@/components/admin/content-pages/FixedContentPageForm";
import { fixedContentPageFooterButtons } from "@/lib/admin/form-footer";
import type { FixedContentPageResource } from "@/lib/admin/content-page-resources";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAdminContentPageBySlug, useContentPageMutations } from "@/hooks/useContentPages";
import { adminType } from "@/lib/admin/typography";

export default function FixedContentPageAdmin({
  resource,
}: {
  resource: FixedContentPageResource;
}) {
  const router = useRouter();
  const { data: contentPage, isLoading, isError } = useAdminContentPageBySlug(resource.slug);
  const { update } = useContentPageMutations();

  if (isLoading) {
    return (
      <BackPanel>
        <p className={adminType.loading}>Loading {resource.title}...</p>
      </BackPanel>
    );
  }

  if (isError || !contentPage) {
    return (
      <BackPanel>
        <p className={adminType.error}>
          {resource.title} could not be loaded. Restart the backend API and refresh this page.
        </p>
      </BackPanel>
    );
  }

  return (
    <BackPanel
      buttons={fixedContentPageFooterButtons({
        saveLabel: resource.saveLabel,
        isPending: update.isPending,
        onCancel: () => router.back(),
      })}
    >
      <FixedContentPageForm
        resource={resource}
        initialPage={contentPage}
        isPending={update.isPending}
        onSubmit={async (payload) => {
          try {
            await update.mutateAsync({ id: contentPage._id, payload });
            toast.success(`${resource.title} updated`);
          } catch (err) {
            toast.error(getApiErrorMessage(err, `Could not update ${resource.title}`));
          }
        }}
      />
    </BackPanel>
  );
}
