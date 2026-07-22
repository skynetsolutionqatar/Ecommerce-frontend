"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import CategoryForm, { CATEGORY_FORM_TABS } from "@/components/admin/categories/CategoryForm";
import { categoryFormFooterButtons } from "@/lib/admin/form-footer";
import { useCategoryMutations } from "@/hooks/useCategories";
import type { CreateCategoryPayload } from "@/types/category.types";

export default function AdminCategoryAddPage() {
  const router = useRouter();
  const { create } = useCategoryMutations();

  return (
    <BackPanel
      // tabs={[...CATEGORY_FORM_TABS]}
      buttons={categoryFormFooterButtons({
        isPending: create.isPending,
        onCancel: () => router.back(),
      })}
    >
      <CategoryForm
        isPending={create.isPending}
        onSubmit={async (payload) => {
          await create.mutateAsync(payload as CreateCategoryPayload);
          toast.success("Category created");
          router.push("/admin/categories");
        }}
      />
    </BackPanel>
  );
}
