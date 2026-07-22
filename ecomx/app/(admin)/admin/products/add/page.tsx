"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import ProductForm, { PRODUCT_FORM_TABS } from "@/components/admin/products/ProductForm";
import { productFormFooterButtons } from "@/lib/admin/form-footer";
import { useProductMutations } from "@/hooks/useProducts";

export default function AdminProductAddPage() {
  const router = useRouter();
  const { create } = useProductMutations();

  return (
    <BackPanel
      // tabs={[...PRODUCT_FORM_TABS]}
      buttons={productFormFooterButtons({
        isPending: create.isPending,
        onCancel: () => router.back(),
      })}
    >
      <ProductForm
        isPending={create.isPending}
        onSubmit={async (payload) => {
          await create.mutateAsync(payload);
          toast.success("Product created");
          router.push("/admin/products");
        }}
      />
    </BackPanel>
  );
}
