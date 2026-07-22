"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import ProductForm, { PRODUCT_FORM_TABS } from "@/components/admin/products/ProductForm";
import { productFormFooterButtons } from "@/lib/admin/form-footer";
import { useProduct, useProductMutations } from "@/hooks/useProducts";
import { adminType } from "@/lib/admin/typography";

export default function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading, isError } = useProduct(id);
  const { update } = useProductMutations();

  if (isLoading) {
    return (
      <BackPanel>
        <p className={adminType.loading}>Loading product...</p>
      </BackPanel>
    );
  }

  if (isError || !product) {
    return (
      <BackPanel>
        <p className={adminType.error}>Product not found.</p>
      </BackPanel>
    );
  }

  return (
    <BackPanel
      // tabs={[...PRODUCT_FORM_TABS]}
      buttons={productFormFooterButtons({
        isEdit: true,
        isPending: update.isPending,
        onCancel: () => router.back(),
      })}
    >
      <ProductForm
        isEdit
        initialProduct={product}
        isPending={update.isPending}
        onSubmit={async (payload) => {
          await update.mutateAsync({ id, payload });
          toast.success("Product updated");
          router.push("/admin/products");
        }}
      />
    </BackPanel>
  );
}
