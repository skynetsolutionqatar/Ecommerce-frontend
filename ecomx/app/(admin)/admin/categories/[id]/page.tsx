"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import ViewSection from "@/components/admin/utils/ViewSection";
import ViewField from "@/components/admin/utils/ViewField";
import { useCategory, useCategoryMutations } from "@/hooks/useCategories";
import { resolveParentName } from "@/lib/admin/category-form";
import { adminType } from "@/lib/admin/typography";
import { ADMIN_ROUTES } from "@/lib/config";
import { formatDate } from "@/lib/utils";

const TABS = [
  { key: "basic", label: "Basic Info" },
  { key: "display", label: "Display" },
  { key: "media", label: "Media" },
];

export default function AdminCategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: category, isLoading, isError } = useCategory(id);
  const { remove } = useCategoryMutations();

  const handleDelete = async () => {
    if (!category) return;
    if (!window.confirm(`Delete category "${category.name}"? This cannot be undone.`)) return;
    await remove.mutateAsync(id);
    toast.success("Category deleted");
    router.push(ADMIN_ROUTES.categories);
  };

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
      tabs={TABS}
      editPath={`${ADMIN_ROUTES.categories}/edit/${id}`}
      onDelete={() => void handleDelete()}
      deleting={remove.isPending}
    >
      <div className="space-y-6">
        <ViewSection id="basic" title="Basic Info">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField label="Name" value={category.name} />
            <ViewField label="Slug" value={category.slug} />
            <ViewField label="Description" value={category.description} />
            <ViewField label="Parent" value={resolveParentName(category)} />
          </div>
        </ViewSection>

        <ViewSection id="display" title="Display">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField label="Display Order" value={category.displayOrder ?? 0} />
            <ViewField label="Color" value={category.color} />
            <ViewField
              label="Active"
              value={category.isActive !== false ? "Yes" : "No"}
              badge
              badgeColor={category.isActive !== false ? "green" : "gray"}
            />
            <ViewField
              label="Created"
              value={category.createdAt ? formatDate(category.createdAt) : "—"}
            />
          </div>
        </ViewSection>

        <ViewSection id="media" title="Media">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField label="Image URL" value={category.image} />
            <ViewField label="Img Key" value={category.imgKey} />
          </div>
        </ViewSection>
      </div>
    </BackPanel>
  );
}
