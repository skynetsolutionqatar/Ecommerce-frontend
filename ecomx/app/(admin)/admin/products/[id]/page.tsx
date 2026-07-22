"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import ViewSection from "@/components/admin/utils/ViewSection";
import ViewField from "@/components/admin/utils/ViewField";
import ProductMediaView from "@/components/admin/products/ProductMediaView";
import { useProduct, useProductMutations } from "@/hooks/useProducts";
import { resolveCategoryName } from "@/lib/admin/product-form";
import { PRODUCT_STATUS } from "@/lib/Constant";
import { ADMIN_ROUTES } from "@/lib/config";
import { formatDate, formatPrice } from "@/lib/utils";

const TABS = [
  { key: "identity", label: "Identity" },
  { key: "description", label: "Description" },
  { key: "pricing", label: "Pricing" },
  { key: "inventory", label: "Inventory" },
  { key: "media", label: "Media" },
  { key: "shipping", label: "Shipping" },
  { key: "status", label: "Status" },
];

export default function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading, isError } = useProduct(id);
  const { remove } = useProductMutations();

  const handleDelete = async () => {
    if (!product) return;
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    await remove.mutateAsync(id);
    toast.success("Product deleted");
    router.push(ADMIN_ROUTES.products);
  };

  if (isLoading) {
    return (
      <BackPanel>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </BackPanel>
    );
  }

  if (isError || !product) {
    return (
      <BackPanel>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-red-400">Failed to load product</p>
        </div>
      </BackPanel>
    );
  }

  return (
    <BackPanel
      tabs={TABS}
      editPath={`${ADMIN_ROUTES.products}/edit/${id}`}
      onDelete={() => void handleDelete()}
      deleting={remove.isPending}
    >
      <div className="space-y-6">
        <ViewSection id="identity" title="Identity">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField label="Name" value={product.name} />
            <ViewField label="Slug" value={product.slug} />
            <ViewField label="Category" value={resolveCategoryName(product)} />
            <ViewField label="SKU" value={product.sku} />
            <ViewField label="Barcode" value={product.barcode} />
            <ViewField label="Brand" value={product.brand} />
            <ViewField label="Tags" value={product.tags?.join(", ")} />
          </div>
        </ViewSection>

        <ViewSection id="description" title="Description">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField label="Short Description" value={product.shortDescription} />
            <ViewField label="Description" value={product.description} />
          </div>
        </ViewSection>

        <ViewSection id="pricing" title="Pricing">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField label="Price" value={formatPrice(product.price)} />
            <ViewField
              label="Compare At"
              value={product.compareAtPrice ? formatPrice(product.compareAtPrice) : "—"}
            />
            <ViewField
              label="Cost Price"
              value={product.costPrice ? formatPrice(product.costPrice) : "—"}
            />
            <ViewField label="Tax %" value={product.taxPercent ?? 0} />
            <ViewField label="Badge" value={product.badge} />
            <ViewField label="Badge Color" value={product.badgeColor} />
          </div>
        </ViewSection>

        <ViewSection id="inventory" title="Inventory">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField label="Stock" value={product.stock ?? 0} />
            <ViewField label="Low Stock Alert" value={product.lowStockAlert ?? 5} />
            <ViewField label="Track Inventory" value={product.trackInventory ? "Yes" : "No"} badge badgeColor={product.trackInventory ? "green" : "gray"} />
            <ViewField label="Has Variants" value={product.hasVariants ? "Yes" : "No"} badge badgeColor={product.hasVariants ? "blue" : "gray"} />
            <ViewField label="Total Sold" value={product.totalSold ?? 0} />
            <ViewField label="Rating" value={`${product.averageRating?.toFixed(1) ?? "0"} (${product.reviewCount ?? 0})`} />
          </div>
        </ViewSection>

        <ViewSection id="media" title="Media">
          <ProductMediaView thumbnail={product.thumbnail} images={product.images} />
        </ViewSection>

        <ViewSection id="shipping" title="Shipping">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField label="Free Shipping" value={product.isFreeShipping ? "Yes" : "No"} badge badgeColor={product.isFreeShipping ? "green" : "gray"} />
            <ViewField label="Weight (g)" value={product.dimensions?.weight ?? 0} />
            <ViewField label="Length (cm)" value={product.dimensions?.length ?? 0} />
            <ViewField label="Width (cm)" value={product.dimensions?.width ?? 0} />
            <ViewField label="Height (cm)" value={product.dimensions?.height ?? 0} />
          </div>
        </ViewSection>

        <ViewSection id="status" title="Status & Flags">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField
              label="Status"
              value={product.status}
              badge
              badgeColor={
                product.status === PRODUCT_STATUS.ACTIVE
                  ? "green"
                  : product.status === PRODUCT_STATUS.DRAFT
                    ? "gray"
                    : "yellow"
              }
            />
            <ViewField label="Featured" value={product.isFeatured ? "Yes" : "No"} badge badgeColor={product.isFeatured ? "blue" : "gray"} />
            <ViewField label="New" value={product.isNew ? "Yes" : "No"} badge badgeColor={product.isNew ? "blue" : "gray"} />
            <ViewField label="Best Seller" value={product.isBestSeller ? "Yes" : "No"} badge badgeColor={product.isBestSeller ? "blue" : "gray"} />
            <ViewField label="Digital" value={product.isDigital ? "Yes" : "No"} badge badgeColor={product.isDigital ? "blue" : "gray"} />
            <ViewField label="Created" value={product.createdAt ? formatDate(product.createdAt) : "—"} />
          </div>
        </ViewSection>
      </div>
    </BackPanel>
  );
}
