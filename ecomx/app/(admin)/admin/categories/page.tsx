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
import { useCategories } from "@/hooks/useCategories";
import { paginateClientList, LIST_PAGE_SIZE } from "@/lib/admin/client-pagination";
import { resolveParentName } from "@/lib/admin/category-form";
import { ADMIN_ROUTES } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import type { ApiCategory } from "@/types/category.types";

const ACTIVE_OPTIONS = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(1);
  const { data: categories = [], isLoading, isError } = useCategories();

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        !search.trim() ||
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.slug.toLowerCase().includes(search.toLowerCase());

      const matchesActive =
        activeFilter === "" ||
        (activeFilter === "true" ? cat.isActive !== false : cat.isActive === false);

      return matchesSearch && matchesActive;
    });
  }, [categories, search, activeFilter]);

  const pagination = paginateClientList(filteredCategories, page, LIST_PAGE_SIZE);
  const pagedCategories = pagination.items;

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
      loadingMessage="Loading categories..."
      errorMessage="Failed to load categories"
    >
      <PageHeader
        title="Categories"
        description="Organize product categories"
        actionLabel="Add Category"
        onAction={() => router.push(`${ADMIN_ROUTES.categories}/add`)}
        btnClassName="rounded-md bg-black px-4 py-2 text-sm text-white"
      />

      <ListToolbar
        search={search}
        onSearchChange={handlers.onSearch}
        searchPlaceholder="Search categories..."
        filters={[
          {
            key: "active",
            value: activeFilter,
            placeholder: "All statuses",
            options: ACTIVE_OPTIONS,
            onChange: handlers.onActive,
          },
        ]}
      />

      <ListTableCard
        footer={
          <ListPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            showing={pagedCategories.length}
            onPageChange={setPage}
            hasNext={pagination.hasNext}
          />
        }
      >
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-5 py-3 text-left">#</th>
              <th className="px-5 py-3 text-left">Category</th>
              <th className="px-5 py-3 text-left">Parent</th>
              <th className="px-5 py-3 text-left">Order</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {pagedCategories.length > 0 ? (
              pagedCategories.map((cat: ApiCategory, index: number) => (
                <tr
                  key={cat._id}
                  onClick={() => router.push(ADMIN_ROUTES.category(cat._id))}
                  className="cursor-pointer border-t hover:bg-gray-50"
                >
                  <td className="px-5 py-4 text-gray-400">
                    {(pagination.page - 1) * LIST_PAGE_SIZE + index + 1}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">{cat.name}</p>
                    <p className="text-xs text-gray-500">{cat.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{resolveParentName(cat)}</td>
                  <td className="px-5 py-4">{cat.displayOrder ?? 0}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        cat.isActive !== false
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {cat.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {cat.createdAt ? formatDate(cat.createdAt) : "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ListTableCard>
    </ListPageShell>
  );
}
