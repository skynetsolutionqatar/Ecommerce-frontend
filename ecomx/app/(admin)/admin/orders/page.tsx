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
import { useOrders } from "@/hooks/useOrders";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_LIST,
} from "@/lib/Constant";
import { ADMIN_ROUTES } from "@/lib/config";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { orderTotal } from "@/types/order.types";
import type { ApiOrder, OrderStatus } from "@/types/order.types";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = ORDER_STATUS_LIST.map((status) => ({
  label: ORDER_STATUS_LABEL[status],
  value: status,
}));

function statusClass(status: string) {
  const map: Record<string, string> = {
    [ORDER_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
    [ORDER_STATUS.CONFIRMED]: "bg-blue-100 text-blue-800",
    [ORDER_STATUS.PROCESSING]: "bg-indigo-100 text-indigo-800",
    [ORDER_STATUS.SHIPPED]: "bg-purple-100 text-purple-800",
    [ORDER_STATUS.DELIVERED]: "bg-green-100 text-green-800",
    [ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useOrders({
    ...(status ? { status: status as OrderStatus } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
    page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? orders.length;

  const handlers = useMemo(
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
      loadingMessage="Loading orders..."
      errorMessage="Failed to load orders"
    >
      <PageHeader title="Orders" description="Manage customer orders" />

      <ListToolbar
        search={search}
        onSearchChange={handlers.onSearch}
        searchPlaceholder="Search orders..."
        filters={[
          {
            key: "status",
            value: status,
            placeholder: "All statuses",
            options: STATUS_OPTIONS,
            onChange: handlers.onStatus,
          },
        ]}
      />

      <ListTableCard
        footer={
          <ListPagination
            page={page}
            totalPages={totalPages}
            total={total}
            showing={orders.length}
            onPageChange={setPage}
            hasNext={pagination?.hasNextPage}
          />
        }
      >
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-5 py-3 text-left">#</th>
              <th className="px-5 py-3 text-left">Order #</th>
              <th className="px-5 py-3 text-left">Customer</th>
              <th className="px-5 py-3 text-left">Total</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order: ApiOrder, index: number) => (
                <tr
                  key={order._id}
                  onClick={() => router.push(ADMIN_ROUTES.order(order._id))}
                  className="cursor-pointer border-t hover:bg-gray-50"
                >
                  <td className="px-5 py-4 text-gray-400">{(page - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="px-5 py-4 font-mono font-medium">{order.orderNumber}</td>
                  <td className="px-5 py-4">
                    {typeof order.customerId === "object" ? order.customerId.name : "—"}
                  </td>
                  <td className="px-5 py-4 font-medium">{formatPrice(orderTotal(order))}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{formatDateTime(order.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ListTableCard>
    </ListPageShell>
  );
}
