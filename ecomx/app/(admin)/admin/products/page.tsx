"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/admin/utils/PageHeader";
import {
  ListPageShell,
  ListPagination,
  ListTableCard,
  ListToolbar,
} from "@/components/admin/shared";
import { useProducts } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { PRODUCT_STATUS } from "@/lib/Constant";
import { ADMIN_ROUTES } from "@/lib/config";
import { formatPrice } from "@/lib/utils";
import type { ApiProduct, ProductStatus } from "@/types/product.types";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { label: "Active", value: PRODUCT_STATUS.ACTIVE },
  { label: "Draft", value: PRODUCT_STATUS.DRAFT },
  { label: "Archived", value: PRODUCT_STATUS.ARCHIVED },
];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    [PRODUCT_STATUS.ACTIVE]: "bg-green-100 text-green-700",
    [PRODUCT_STATUS.DRAFT]: "bg-gray-100 text-gray-600",
    [PRODUCT_STATUS.ARCHIVED]: "bg-orange-100 text-orange-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError } = useProducts({
    search: debouncedSearch || undefined,
    status: status ? (status as ProductStatus) : undefined,
    page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const products = data?.products ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? products.length;

  const resetPage = useMemo(
    () => ({
      onSearch: (value: string) => {
        setSearch(value);
        setPage(1);
      },
      onStatus: (value: string) => {
        setStatus(value);
        setPage(1);
      },
    }),
    []
  );

  return (
    <ListPageShell
      isLoading={isLoading}
      isError={isError}
      loadingMessage="Loading products..."
      errorMessage="Failed to load products"
    >
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        actionLabel="Add Product"
        onAction={() => router.push(`${ADMIN_ROUTES.products}/add`)}
        btnClassName="rounded-md bg-black px-4 py-2 text-sm text-white"
      />

      <ListToolbar
        search={search}
        onSearchChange={resetPage.onSearch}
        searchPlaceholder="Search products..."
        filters={[
          {
            key: "status",
            value: status,
            placeholder: "All statuses",
            options: STATUS_OPTIONS,
            onChange: resetPage.onStatus,
          },
        ]}
      />

      <ListTableCard
        footer={
          <ListPagination
            page={page}
            totalPages={totalPages}
            total={total}
            showing={products.length}
            onPageChange={setPage}
            hasNext={pagination?.hasNextPage}
          />
        }
      >
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-5 py-3 text-left">#</th>
              <th className="px-5 py-3 text-left">Product</th>
              <th className="px-5 py-3 text-left">Brand</th>
              <th className="px-5 py-3 text-left">Price</th>
              <th className="px-5 py-3 text-left">Stock</th>
              <th className="px-5 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product: ApiProduct, index: number) => (
                <tr
                  key={product._id}
                  onClick={() => router.push(ADMIN_ROUTES.product(product._id))}
                  className="cursor-pointer border-t hover:bg-gray-50"
                >
                  <td className="px-5 py-4 text-gray-400">{(page - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sku ?? product.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{product.brand ?? "—"}</td>
                  <td className="px-5 py-4 font-medium">{formatPrice(product.price)}</td>
                  <td className={`px-5 py-4 font-medium ${product.isLowStock ? "text-red-600" : ""}`}>
                    {product.stock ?? 0}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadge(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ListTableCard>
    </ListPageShell>
  );
}
