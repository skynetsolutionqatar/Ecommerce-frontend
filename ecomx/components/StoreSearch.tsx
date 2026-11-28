"use client";

import SearchModal from "@/components/SearchModal";
import MobileSearchScreen from "@/components/store/mobile/MobileSearchScreen";
import type { Product } from "@/lib/types";

export default function StoreSearch({
  open,
  onClose,
  onProductSelect,
}: {
  open: boolean;
  onClose: () => void;
  onProductSelect?: (product: Product) => void;
}) {
  if (!open) return null;

  return (
    <>
      <MobileSearchScreen onClose={onClose} onProductSelect={onProductSelect} />
      <div className="hidden md:block">
        <SearchModal open onClose={onClose} onProductSelect={onProductSelect} />
      </div>
    </>
  );
}