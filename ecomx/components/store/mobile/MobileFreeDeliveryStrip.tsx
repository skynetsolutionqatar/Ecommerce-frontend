"use client";

import { FileText, Truck } from "lucide-react";
import { getDeliveryPromoText } from "@/lib/store/delivery-promo";
import type { PublicDeliverySettings } from "@/types/delivery-settings.types";

export default function MobileFreeDeliveryStrip({
  settings,
}: {
  settings?: PublicDeliverySettings | null;
}) {
  const promo = getDeliveryPromoText(settings ?? null);

  return (
    <div className="mx-4 overflow-hidden rounded-lg bg-[#f1f5f3]">
      <div className="flex items-center gap-3 px-3.5 py-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
          <Truck className="h-[22px] w-[22px] text-[#0a255d]" strokeWidth={1.9} />
        </span>
        <p className="flex-1 text-[13px] font-extrabold leading-[18px] text-gray-900">{promo}</p>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-[#dce4e0] px-3.5 py-2">
        <FileText className="h-[18px] w-[18px] text-gray-500" strokeWidth={1.7} />
        <span className="text-[10px] font-bold text-gray-500">Secure card checkout</span>
      </div>
    </div>
  );
}