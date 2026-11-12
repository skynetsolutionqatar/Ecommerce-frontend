"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import HeroSliderForm from "@/components/admin/hero-sliders/HeroSliderForm";
import { createFormFooterButtons, HERO_SLIDER_FORM_ID } from "@/lib/admin/form-footer";
import { ADMIN_ROUTES } from "@/lib/config";
import { useHeroSlider, useHeroSliderMutations } from "@/hooks/useHeroSliders";
import { adminType } from "@/lib/admin/typography";
import type { UpdateHeroSliderPayload } from "@/types/hero-slider.types";

export default function AdminHeroSliderEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: slide, isLoading, isError } = useHeroSlider(id);
  const { update } = useHeroSliderMutations();

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

  return (
    <BackPanel
      buttons={createFormFooterButtons({
        formId: HERO_SLIDER_FORM_ID,
        entityLabel: "slide",
        isEdit: true,
        isPending: update.isPending,
        onCancel: () => router.back(),
      })}
    >
      <HeroSliderForm
        initialSlide={slide}
        isEdit
        isPending={update.isPending}
        onSubmit={async (payload) => {
          await update.mutateAsync({ id, payload: payload as UpdateHeroSliderPayload });
          toast.success("Hero slide updated");
          router.push(ADMIN_ROUTES.heroSlider(id));
        }}
      />
    </BackPanel>
  );
}
