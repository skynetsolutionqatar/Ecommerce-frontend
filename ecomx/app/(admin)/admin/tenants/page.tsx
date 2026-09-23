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
import TenantAdminGuard from "@/components/admin/tenants/TenantAdminGuard";
import { useTenants } from "@/hooks/useTenants";
import { useTenantAccess } from "@/hooks/useTenantAccess";
import { useDebounce } from "@/hooks/useDebounce";
import { LIST_PAGE_SIZE } from "@/lib/admin/client-pagination";
import { TENANT_ZONES } from "@/lib/admin/tenant-form";
import { ADMIN_ROUTES } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import type { ApiTenant, TenantZone } from "@/types/tenant.types";

const ZONE_OPTIONS = TENANT_ZONES.map((z) => ({ label: z.label, value: z.value }));

export default function AdminTenantsPage() {
  const router = useRouter();
  const { canList, canCreate } = useTenantAccess();
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError } = useTenants(
    {
      search: debouncedSearch || undefined,
      zone: zoneFilter ? (zoneFilter as TenantZone) : undefined,
      page,
      limit: LIST_PAGE_SIZE,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    canList
  );

  const tenants = data?.tenants ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? tenants.length;

  const handlers = useMemo(
    () => ({
      onSearch: (value: string) => {
        setSearch(value);
        setPage(1);
      },
      onZone: (value: string) => {
        setZoneFilter(value);
        setPage(1);
      },
    }),
    []
  );

  return (
    <TenantAdminGuard>
      <ListPageShell
        isLoading={isLoading}
        isError={isError}
        loadingMessage="Loading stores..."
        errorMessage="Failed to load stores"
      >
        <PageHeader
          title="Stores"
          description="Manage tenant stores"
          actionLabel={canCreate ? "Add Store" : undefined}
          onAction={canCreate ? () => router.push(`${ADMIN_ROUTES.tenants}/add`) : undefined}
          btnClassName="rounded-md bg-black px-4 py-2 text-sm text-white"
        />

        <ListToolbar
          search={search}
          onSearchChange={handlers.onSearch}
          searchPlaceholder="Search stores..."
          filters={[
            {
              key: "zone",
              value: zoneFilter,
              placeholder: "All zones",
              options: ZONE_OPTIONS,
              onChange: handlers.onZone,
            },
          ]}
        />

        <ListTableCard
          footer={
            <ListPagination
              showing={tenants.length}
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={setPage}
            />
          }
        >
          <table className="admin-table w-full text-sm">
            <thead className="admin-table-head">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Slug</th>
                <th className="px-5 py-3 text-left">Zone</th>
                <th className="px-5 py-3 text-left">Currency</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant: ApiTenant) => (
                <tr
                  key={tenant._id}
                  className="admin-table-row cursor-pointer"
                  onClick={() => router.push(ADMIN_ROUTES.tenant(tenant.slug))}
                >
                  <td className="px-5 py-4 font-medium">{tenant.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{tenant.slug}</td>
                  <td className="px-5 py-4">{tenant.zone.replace(/_/g, " ")}</td>
                  <td className="px-5 py-4">{tenant.currency}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        tenant.isActive !== false
                          ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tenant.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {tenant.createdAt ? formatDate(tenant.createdAt) : "—"}
                  </td>
                </tr>
              ))}
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    No stores found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </ListTableCard>
      </ListPageShell>
    </TenantAdminGuard>
  );
}
