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
import { COUPON_DISCOUNT_TYPE, COUPON_STATUS, COUPON_STATUS_LIST } from "@/lib/Constant";
import { useCouponsWithMeta } from "@/hooks/useCoupons";
import { useDebounce } from "@/hooks/useDebounce";
import { LIST_PAGE_SIZE } from "@/lib/admin/client-pagination";
import { ADMIN_ROUTES } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import type { ApiCoupon, CouponStatus } from "@/types/coupon.types";

const STATUS_OPTIONS = COUPON_STATUS_LIST.filter((s) => s !== COUPON_STATUS.EXPIRED).map(
  (status) => ({
    label: status.charAt(0).toUpperCase() + status.slice(1),
    value: status,
  })
);

export default function AdminCouponsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, error } = useCouponsWithMeta({
    search: debouncedSearch || undefined,
    status: statusFilter ? (statusFilter as CouponStatus) : undefined,
    page,
    limit: LIST_PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const coupons = data?.coupons ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? coupons.length;

  const handlers = useMemo(
    () => ({
      onSearch: (value: string) => {
        setSearch(value);
        setPage(1);
      },
      onStatus: (value: string) => {
        setStatusFilter(value);
        setPage(1);
      },
    }),
    []
  );

  return (
    <ListPageShell
      isLoading={isLoading}
      isError={false}
      loadingMessage="Loading coupons..."
    >
      <PageHeader
        title="Coupons"
        description="Manage discount codes"
        actionLabel="Add Coupon"
        onAction={() => router.push(`${ADMIN_ROUTES.coupons}/add`)}
        btnClassName="rounded-md bg-black px-4 py-2 text-sm text-white"
      />

      {isError && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Coupons API is not available yet. Mount the /coupons route on the backend to enable this feature.
        </div>
      )}

      <ListToolbar
        search={search}
        onSearchChange={handlers.onSearch}
        searchPlaceholder="Search coupons..."
        filters={[
          {
            key: "status",
            value: statusFilter,
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
            showing={coupons.length}
            onPageChange={setPage}
            hasNext={pagination?.hasNextPage}
          />
        }
      >
        <table className="admin-table w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-5 py-3 text-left">#</th>
              <th className="px-5 py-3 text-left">Code</th>
              <th className="px-5 py-3 text-left">Title</th>
              <th className="px-5 py-3 text-left">Type</th>
              <th className="px-5 py-3 text-left">Value</th>
              <th className="px-5 py-3 text-left">Used</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Expires</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length > 0 ? (
              coupons.map((coupon: ApiCoupon, index: number) => (
                <tr
                  key={coupon._id}
                  onClick={() => router.push(ADMIN_ROUTES.coupon(coupon._id))}
                  className="cursor-pointer border-t hover:bg-gray-50"
                >
                  <td className="px-5 py-4 text-gray-400">
                    {(page - 1) * LIST_PAGE_SIZE + index + 1}
                  </td>
                  <td className="px-5 py-4 font-mono font-bold">{coupon.code}</td>
                  <td className="px-5 py-4">{coupon.title}</td>
                  <td className="px-5 py-4 capitalize">{coupon.type.replace("_", " ")}</td>
                  <td className="px-5 py-4">
                    {coupon.type === COUPON_DISCOUNT_TYPE.PERCENTAGE
                      ? `${coupon.value}%`
                      : coupon.type === COUPON_DISCOUNT_TYPE.FREE_SHIPPING
                        ? "Free shipping"
                        : `QAR ${coupon.value}`}
                  </td>
                  <td className="px-5 py-4">
                    {coupon.usedCount ?? 0}
                    {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td className="px-5 py-4 capitalize">{coupon.status}</td>
                  <td className="px-5 py-4 text-gray-500">
                    {coupon.expiryDate ? formatDate(coupon.expiryDate) : "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-400">
                  {error ? "Coupons unavailable" : "No coupons found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ListTableCard>
    </ListPageShell>
  );
}
