"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import HeroSliderForm from "@/components/admin/hero-sliders/HeroSliderForm";
import { createFormFooterButtons, HERO_SLIDER_FORM_ID } from "@/lib/admin/form-footer";
import { ADMIN_ROUTES } from "@/lib/config";
import { useHeroSliderMutations } from "@/hooks/useHeroSliders";
import type { CreateHeroSliderPayload } from "@/types/hero-slider.types";

export default function AdminHeroSliderAddPage() {
  const router = useRouter();
  const { create } = useHeroSliderMutations();

  return (
    <BackPanel
      buttons={createFormFooterButtons({
        formId: HERO_SLIDER_FORM_ID,
        entityLabel: "slide",
        isPending: create.isPending,
        onCancel: () => router.back(),
      })}
    >
      <HeroSliderForm
        isPending={create.isPending}
        onSubmit={async (payload) => {
          await create.mutateAsync(payload as CreateHeroSliderPayload);
          toast.success("Hero slide created");
          router.push(ADMIN_ROUTES.heroSliders);
        }}
      />
    </BackPanel>
  );
}
