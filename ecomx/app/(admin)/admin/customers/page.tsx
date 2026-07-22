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
import { useCustomers, useCustomerMutations } from "@/hooks/useCustomers";
import { useDebounce } from "@/hooks/useDebounce";
import { ADMIN_ROUTES } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import type { ApiCustomer } from "@/types/customer.types";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

export default function AdminCustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError } = useCustomers({
    search: debouncedSearch || undefined,
    ...(activeFilter === "true" ? { isActive: true } : activeFilter === "false" ? { isActive: false } : {}),
    page,
    limit: PAGE_SIZE,
  });
  const { toggleStatus } = useCustomerMutations();

  const customers = data?.customers ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? customers.length;

  const handlers = useMemo(
    () => ({
      onSearch: (value: string) => {
        setSearch(value);
        setPage(1);
      },
      onActive: (value: string) => {
        setActiveFilter(value);
        setPage(1);
      },
    }),
    []
  );

  return (
    <ListPageShell
      isLoading={isLoading}
      isError={isError}
      loadingMessage="Loading customers..."
      errorMessage="Failed to load customers"
    >
      <PageHeader title="Customers" description="Manage store customers" />

      <ListToolbar
        search={search}
        onSearchChange={handlers.onSearch}
        searchPlaceholder="Search customers..."
        filters={[
          {
            key: "active",
            value: activeFilter,
            placeholder: "All statuses",
            options: STATUS_OPTIONS,
            onChange: handlers.onActive,
          },
        ]}
      />

      <ListTableCard
        footer={
          <ListPagination
            page={page}
            totalPages={totalPages}
            total={total}
            showing={customers.length}
            onPageChange={setPage}
            hasNext={pagination?.hasNextPage}
          />
        }
      >
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-5 py-3 text-left">#</th>
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Email</th>
              <th className="px-5 py-3 text-left">Phone</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Joined</th>
              <th className="px-5 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer: ApiCustomer, index: number) => (
                <tr key={customer._id} className="border-t hover:bg-gray-50">
                  <td
                    className="cursor-pointer px-5 py-4 text-gray-400"
                    onClick={() => router.push(ADMIN_ROUTES.customer(customer._id))}
                  >
                    {(page - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td
                    className="cursor-pointer px-5 py-4 font-medium"
                    onClick={() => router.push(ADMIN_ROUTES.customer(customer._id))}
                  >
                    {customer.name}
                  </td>
                  <td
                    className="cursor-pointer px-5 py-4"
                    onClick={() => router.push(ADMIN_ROUTES.customer(customer._id))}
                  >
                    {customer.email}
                  </td>
                  <td
                    className="cursor-pointer px-5 py-4 text-gray-500"
                    onClick={() => router.push(ADMIN_ROUTES.customer(customer._id))}
                  >
                    {customer.phone || "—"}
                  </td>
                  <td
                    className="cursor-pointer px-5 py-4 capitalize"
                    onClick={() => router.push(ADMIN_ROUTES.customer(customer._id))}
                  >
                    {customer.role}
                  </td>
                  <td
                    className="cursor-pointer px-5 py-4"
                    onClick={() => router.push(ADMIN_ROUTES.customer(customer._id))}
                  >
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        customer.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {customer.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td
                    className="cursor-pointer px-5 py-4 text-gray-500"
                    onClick={() => router.push(ADMIN_ROUTES.customer(customer._id))}
                  >
                    {customer.createdAt ? formatDate(customer.createdAt) : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => void toggleStatus.mutateAsync(customer._id)}
                      className="rounded-md border px-3 py-1 text-xs font-semibold hover:bg-gray-50"
                    >
                      {customer.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-400">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ListTableCard>
    </ListPageShell>
  );
}
