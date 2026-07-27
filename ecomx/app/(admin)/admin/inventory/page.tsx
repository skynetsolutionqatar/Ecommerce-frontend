"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/admin/utils/PageHeader";
import {
  ListPageShell,
  ListPagination,
  ListTableCard,
  ListToolbar,
} from "@/components/admin/shared";
import { useLowStockWithMeta } from "@/hooks/useInventory";
import { useDebounce } from "@/hooks/useDebounce";
import { LIST_PAGE_SIZE } from "@/lib/admin/client-pagination";
import { ADMIN_ROUTES } from "@/lib/config";
import type { LowStockProduct } from "@/types/inventory.types";

export default function AdminInventoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError } = useLowStockWithMeta({
    search: debouncedSearch || undefined,
    page,
    limit: LIST_PAGE_SIZE,
  });

  const products = data?.products ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? products.length;

  return (
    <ListPageShell
      isLoading={isLoading}
      isError={isError}
      loadingMessage="Loading inventory..."
      errorMessage="Failed to load inventory"
    >
      <PageHeader
        title="Inventory"
        description="Products below their low-stock alert threshold — click a row to adjust stock and view history"
      />

      <ListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search products..."
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
        <table className="admin-table w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-5 py-3 text-left">#</th>
              <th className="px-5 py-3 text-left">Product</th>
              <th className="px-5 py-3 text-left">SKU</th>
              <th className="px-5 py-3 text-left">Current Stock</th>
              <th className="px-5 py-3 text-left">Alert Threshold</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((row: LowStockProduct, index: number) => (
                <tr
                  key={row._id}
                  onClick={() => router.push(ADMIN_ROUTES.inventoryProduct(row._id))}
                  className="cursor-pointer border-t hover:bg-gray-50"
                >
                  <td className="px-5 py-4 text-gray-400">
                    {(page - 1) * LIST_PAGE_SIZE + index + 1}
                  </td>
                  <td className="px-5 py-4 font-medium">{row.name}</td>
                  <td className="px-5 py-4 text-gray-500">{row.sku ?? "—"}</td>
                  <td className="px-5 py-4 font-bold text-red-600">{row.stock}</td>
                  <td className="px-5 py-4">{row.lowStockAlert ?? 5}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400">
                  No low stock alerts — inventory is healthy
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ListTableCard>
    </ListPageShell>
  );
}
