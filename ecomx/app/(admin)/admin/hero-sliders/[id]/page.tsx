"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import ViewField from "@/components/admin/utils/ViewField";
import HeroSliderModePanel from "@/components/admin/hero-sliders/HeroSliderModePanel";
import { useHeroSlider, useHeroSliderMutations } from "@/hooks/useHeroSliders";
import { adminType } from "@/lib/admin/typography";
import { ADMIN_ROUTES } from "@/lib/config";
import { heroSliderLifecycleLabel } from "@/lib/admin/hero-slider-status";

export default function AdminHeroSliderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: slide, isLoading, isError } = useHeroSlider(id);
  const { remove, update } = useHeroSliderMutations();

  const handleDelete = async () => {
    if (!slide) return;
    await remove.mutateAsync(id);
    toast.success("Hero slide deleted");
    router.push(ADMIN_ROUTES.heroSliders);
  };

  if (isLoading) {
    return (
      <BackPanel>
        <p className={adminType.loading}>Loading slide...</p>
      </BackPanel>
    );
  }

  if (isError || !slide) {
    return (
      <BackPanel>
        <p className={adminType.error}>Hero slide not found.</p>
      </BackPanel>
    );
  }

  const archiveSlide = async () => {
    await update.mutateAsync({ id, payload: { isArchived: true, isPublished: false } });
    toast.success("Slide archived — content and images kept");
  };

  const restoreSlide = async (publish: boolean) => {
    await update.mutateAsync({
      id,
      payload: { isArchived: false, isPublished: publish },
    });
    toast.success(publish ? "Slide restored and published" : "Slide restored (not published yet)");
  };

  const lifecycleButtons = slide.isArchived
    ? [
        {
          label: "Restore & publish",
          onClick: () => restoreSlide(true),
          disabled: update.isPending,
          className:
            "rounded-lg border border-emerald-700 bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50",
        },
        {
          label: "Restore only",
          onClick: () => restoreSlide(false),
          disabled: update.isPending,
          className:
            "rounded-lg border border-border bg-white px-5 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50",
        },
      ]
    : [
        {
          label: "Archive",
          onClick: archiveSlide,
          disabled: update.isPending,
          className:
            "rounded-lg border border-amber-700 bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50",
        },
      ];

  return (
    <BackPanel
      editPath={`${ADMIN_ROUTES.heroSliders}/edit/${id}`}
      deleteItemName={slide.title}
      onDelete={handleDelete}
      deleting={remove.isPending}
      buttons={lifecycleButtons}
    >
      <div className="space-y-6">
        <HeroSliderModePanel
          id="view-content-mode"
          title="Content handling"
          description="Standard hero copy, pricing, colors, and product image."
          defaultOpen
        >
          <div className="grid gap-4 md:grid-cols-2">
            <ViewField label="Offer label" value={slide.offerLabel?.trim() || "—"} />
            <ViewField label="Title" value={slide.title?.trim() || "—"} />
            <ViewField label="Status" value={heroSliderLifecycleLabel(slide)} />
            <ViewField label="Published" value={slide.isPublished ? "Yes" : "No"} />
            <ViewField label="Archived" value={slide.isArchived ? "Yes" : "No"} />
            <ViewField label="Display order" value={String(slide.displayOrder)} />
            <ViewField label="Eyebrow" value={slide.eyebrow || "—"} />
            <ViewField label="Subtitle" value={slide.sub || "—"} />
            <ViewField label="Footnote" value={slide.note || "—"} />
            <ViewField label="CTA" value={slide.cta || "—"} />
            <ViewField label="Product slug" value={slide.productSlug || "—"} />
            <ViewField label="Price" value={slide.price != null ? String(slide.price) : "—"} />
            <ViewField
              label="Compare at"
              value={slide.compareAtPrice != null ? String(slide.compareAtPrice) : "—"}
            />
            <ViewField label="Discount %" value={slide.discount != null ? String(slide.discount) : "—"} />
            <ViewField label="Surface color" value={slide.surfaceColor || "—"} />
            <ViewField label="Accent color" value={slide.accentColor || "—"} />
            <ViewField label="Accent highlight" value={slide.accentNeon || "—"} />
            <ViewField label="Product image URL" value={slide.img || "—"} />
          </div>
        </HeroSliderModePanel>

        <HeroSliderModePanel
          id="view-poster-mode"
          title="Poster handling"
          description="Full-cover poster asset and live-site poster mode."
          defaultOpen={false}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <ViewField
              label="Storefront mode"
              value={slide.isPoster ? "Full-cover poster" : "Content + product image"}
            />
            <ViewField label="Desktop poster URL" value={slide.posterImg || "—"} />
            <ViewField label="Mobile poster URL" value={slide.posterImgMobile || "—"} />
          </div>
        </HeroSliderModePanel>
      </div>
    </BackPanel>
  );
}
