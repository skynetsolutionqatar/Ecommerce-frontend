"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/admin/utils/PageHeader";
import StockUpdateDialog from "@/components/admin/inventory/StockUpdateDialog";
import ReportExport from "@/components/admin/reports/ReportExport";
import {
  ListPageShell,
  ListPagination,
  ListTableCard,
  ListToolbar,
} from "@/components/admin/shared";
import { useInventoryMutations, useProductStock, useStockProductsWithMeta } from "@/hooks/useInventory";
import { useDebounce } from "@/hooks/useDebounce";
import { LIST_PAGE_SIZE } from "@/lib/admin/client-pagination";
import {
  getStockStatusLabel,
  STOCK_REPORT_COLUMNS,
  STOCK_STATUS_FILTER_OPTIONS,
  stockStatusBadgeClass,
} from "@/lib/admin/stock-report";
import { ADMIN_ROUTES } from "@/lib/config";
import type {
  SetStockPayload,
  StockProduct,
  StockProductsQuery,
} from "@/types/inventory.types";
import { Button } from "@/components/ui/button";

export default function AdminInventoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateId = searchParams.get("update");
  const [search, setSearch] = useState("");
  const [stockStatus, setStockStatus] =
    useState<NonNullable<StockProductsQuery["stockStatus"]>>("");
  const [page, setPage] = useState(1);
  const [updateProduct, setUpdateProduct] = useState<StockProduct | null>(null);
  const debouncedSearch = useDebounce(search);
  const { data: pendingUpdateStock } = useProductStock(updateId ?? "");

  const { data, isLoading, isError } = useStockProductsWithMeta({
    search: debouncedSearch || undefined,
    stockStatus: stockStatus || undefined,
    page,
    limit: LIST_PAGE_SIZE,
  });

  const { setStock } = useInventoryMutations();

  const products = data?.products ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? products.length;

  const handleSetStock = async (productId: string, payload: SetStockPayload) => {
    return setStock.mutateAsync({ productId, payload });
  };

  useEffect(() => {
    if (!updateId || !pendingUpdateStock) return;

    setUpdateProduct({
      _id: pendingUpdateStock.productId,
      name: pendingUpdateStock.productName,
      stock: pendingUpdateStock.currentStock,
      lowStockAlert: pendingUpdateStock.lowStockAlert,
    });
    router.replace(ADMIN_ROUTES.inventory, { scroll: false });
  }, [updateId, pendingUpdateStock, router]);

  return (
    <ListPageShell
      isLoading={isLoading}
      isError={isError}
      loadingMessage="Loading inventory..."
      errorMessage="Failed to load inventory"
    >
      <PageHeader
        title="Inventory"
        description="View all product stock levels — update quantities manually or open a product for full history"
        actions={
          <ReportExport
            reportType="stock"
            title="Stock Report"
            columns={STOCK_REPORT_COLUMNS}
            params={{ stockStatus: stockStatus || undefined }}
          />
        }
      />

      <ListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search products..."
        filters={[
          {
            key: "stockStatus",
            value: stockStatus,
            placeholder: "All products",
            options: STOCK_STATUS_FILTER_OPTIONS,
            onChange: (value) => {
              setStockStatus(value === "low" || value === "ok" ? value : "");
              setPage(1);
            },
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
        <table className="admin-table w-full min-w-[1024px] text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="w-12 px-2 py-3 text-left">#</th>
              <th className="min-w-[12rem] px-5 py-3 text-left">Product</th>
              <th className="min-w-[6rem] whitespace-nowrap px-5 py-3 text-left">SKU</th>
              <th className="min-w-[8rem] px-5 py-3 text-left">Category</th>
              <th className="min-w-[6rem] whitespace-nowrap px-5 py-3 text-left">Current Stock</th>
              <th className="min-w-[6rem] whitespace-nowrap px-5 py-3 text-left">Alert Threshold</th>
              <th className="min-w-[6.5rem] whitespace-nowrap px-5 py-3 text-left">Status</th>
              <th className="min-w-[9rem] whitespace-nowrap px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((row: StockProduct, index: number) => {
                const alert = row.lowStockAlert ?? 5;
                const status = getStockStatusLabel(row.stock, alert);
                const categoryName =
                  typeof row.categoryId === "object" && row.categoryId
                    ? row.categoryId.name
                    : "—";

                return (
                  <tr
                    key={row._id}
                    onClick={() => router.push(ADMIN_ROUTES.inventoryProduct(row._id))}
                    className="cursor-pointer border-t hover:bg-gray-50"
                  >
                    <td className="w-12 px-2 py-4 align-top text-gray-400">
                      {(page - 1) * LIST_PAGE_SIZE + index + 1}
                    </td>
                    <td className="min-w-[12rem] max-w-[16rem] px-5 py-4 align-top">
                      <p className="truncate font-medium" title={row.name}>
                        {row.name}
                      </p>
                    </td>
                    <td className="min-w-[6rem] whitespace-nowrap px-5 py-4 align-top text-gray-500">
                      {row.sku ?? "—"}
                    </td>
                    <td className="min-w-[8rem] max-w-[12rem] px-5 py-4 align-top">
                      <p className="truncate text-gray-500" title={categoryName}>
                        {categoryName}
                      </p>
                    </td>
                    <td
                      className={`min-w-[6rem] whitespace-nowrap px-5 py-4 align-top font-bold ${
                        status === "OK" ? "text-gray-900" : "text-red-600"
                      }`}
                    >
                      {row.stock}
                    </td>
                    <td className="min-w-[6rem] whitespace-nowrap px-5 py-4 align-top">
                      {alert}
                    </td>
                    <td className="min-w-[6.5rem] whitespace-nowrap px-5 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${stockStatusBadgeClass(status)}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="min-w-[9rem] whitespace-nowrap px-4 py-4 align-top">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={(event) => {
                          event.stopPropagation();
                          setUpdateProduct(row);
                        }}
                      >
                        Update Stock
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-400">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ListTableCard>

      <StockUpdateDialog
        product={updateProduct}
        open={!!updateProduct}
        onOpenChange={(open) => {
          if (!open) setUpdateProduct(null);
        }}
        isPending={setStock.isPending}
        onSubmit={handleSetStock}
      />
    </ListPageShell>
  );
}
