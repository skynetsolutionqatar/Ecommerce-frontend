"use client";

import { use } from "react";
import BackPanel from "@/components/admin/utils/BackPanel";
import StockAdjustForms from "@/components/admin/inventory/StockAdjustForms";
import ViewSection from "@/components/admin/utils/ViewSection";
import ViewField from "@/components/admin/utils/ViewField";
import { adminType } from "@/lib/admin/typography";
import { useInventoryMutations, useProductStock, useStockHistory } from "@/hooks/useInventory";
import { formatDateTime } from "@/lib/utils";

const TABS = [
  { key: "stock", label: "Stock" },
  { key: "adjust", label: "Adjust" },
  { key: "history", label: "History" },
];

export default function AdminInventoryProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const { data: stock, isLoading, isError, refetch: refetchStock } = useProductStock(productId);
  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useStockHistory(productId);
  const { addStock, reduceStock } = useInventoryMutations();

  const isPending = addStock.isPending || reduceStock.isPending;

  const handleMutation = async () => {
    await Promise.all([refetchStock(), refetchHistory()]);
  };

  if (isLoading) {
    return (
      <BackPanel>
        <p className={adminType.loading}>Loading stock...</p>
      </BackPanel>
    );
  }

  if (isError || !stock) {
    return (
      <BackPanel>
        <p className={adminType.error}>Product stock not found.</p>
      </BackPanel>
    );
  }

  const logs = historyData?.logs ?? [];

  return (
    <BackPanel tabs={TABS}>
      <div className="space-y-6">
        <ViewSection id="stock" title="Current Stock">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <ViewField label="Product" value={stock.productName} />
            <ViewField label="Current stock" value={stock.currentStock} />
            <ViewField label="Low stock alert" value={stock.lowStockAlert} />
            <ViewField
              label="Status"
              value={stock.isLowStock ? "Low stock" : stock.isInStock ? "In stock" : "Out of stock"}
              badge
              badgeColor={stock.isLowStock ? "yellow" : stock.isInStock ? "green" : "gray"}
            />
          </div>
        </ViewSection>

        <ViewSection id="adjust" title="Adjust Stock">
          <StockAdjustForms
            isPending={isPending}
            onAdd={async (payload) => {
              await addStock.mutateAsync({ productId, payload });
              await handleMutation();
            }}
            onReduce={async (payload) => {
              await reduceStock.mutateAsync({ productId, payload });
              await handleMutation();
            }}
          />
        </ViewSection>

        <ViewSection id="history" title="Movement History">
          {historyLoading ? (
            <p className={adminType.loading}>Loading history...</p>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Qty</th>
                    <th className="px-4 py-3 text-left">Stock after</th>
                    <th className="px-4 py-3 text-left">Note</th>
                    <th className="px-4 py-3 text-left">By</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((entry) => (
                      <tr key={entry._id} className="border-t">
                        <td className="px-4 py-3 text-gray-500">{formatDateTime(entry.createdAt)}</td>
                        <td className="px-4 py-3 capitalize">{entry.type.replace("_", " ")}</td>
                        <td className={`px-4 py-3 font-medium ${entry.quantity < 0 ? "text-red-600" : "text-green-700"}`}>
                          {entry.quantity > 0 ? `+${entry.quantity}` : entry.quantity}
                        </td>
                        <td className="px-4 py-3">{entry.stockAfter}</td>
                        <td className="px-4 py-3 text-gray-500">{entry.note || "—"}</td>
                        <td className="px-4 py-3">
                          {typeof entry.doneBy === "object" ? entry.doneBy.name : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No stock movements recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </ViewSection>
      </div>
    </BackPanel>
  );
}
