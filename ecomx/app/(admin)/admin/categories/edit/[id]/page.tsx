"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import CategoryForm, { CATEGORY_FORM_TABS } from "@/components/admin/categories/CategoryForm";
import { categoryFormFooterButtons } from "@/lib/admin/form-footer";
import { useCategory, useCategoryMutations } from "@/hooks/useCategories";
import { adminType } from "@/lib/admin/typography";
import type { UpdateCategoryPayload } from "@/types/category.types";

export default function AdminCategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: category, isLoading, isError } = useCategory(id);
  const { update } = useCategoryMutations();

  if (isLoading) {
    return (
      <BackPanel>
        <p className={adminType.loading}>Loading category...</p>
      </BackPanel>
    );
  }

  if (isError || !category) {
    return (
      <BackPanel>
        <p className={adminType.error}>Category not found.</p>
      </BackPanel>
    );
  }

  return (
    <BackPanel
      // tabs={[...CATEGORY_FORM_TABS]}
      buttons={categoryFormFooterButtons({
        isEdit: true,
        isPending: update.isPending,
        onCancel: () => router.back(),
      })}
    >
      <CategoryForm
        isEdit
        initialCategory={category}
        isPending={update.isPending}
        onSubmit={async (payload) => {
          await update.mutateAsync({ id, payload: payload as UpdateCategoryPayload });
          toast.success("Category updated");
          router.push("/admin/categories");
        }}
      />
    </BackPanel>
  );
}
