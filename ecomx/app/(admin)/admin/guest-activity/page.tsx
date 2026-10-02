"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/admin/utils/PageHeader";
import {
  ListPageShell,
  ListPagination,
  ListTableCard,
  ListToolbar,
} from "@/components/admin/shared";
import {
  useGuestActivitySummary,
  useGuestTimeline,
  useGuestVisitors,
} from "@/hooks/useGuestActivityAdmin";
import { useDebounce } from "@/hooks/useDebounce";
import { formatGuestTimelineDetail } from "@/lib/admin/guest-activity-labels";
import { adminType } from "@/lib/admin/typography";
import { formatDate } from "@/lib/utils";
import type { GuestEventType, GuestVisitorRow } from "@/types/guest-activity.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { label: "Guest", value: "guest" },
  { label: "Registered", value: "registered" },
];

const CART_OPTIONS = [
  { label: "Has cart (no checkout)", value: "abandoned" },
  { label: "Checkout started", value: "checkout_started" },
];

const EVENT_OPTIONS: { label: string; value: GuestEventType }[] = [
  { label: "Store visit", value: "store_visit" },
  { label: "Product view", value: "product_view" },
  { label: "Search", value: "product_search" },
  { label: "Add to cart", value: "add_to_cart" },
  { label: "Wishlist", value: "add_to_wishlist" },
  { label: "Checkout started", value: "checkout_started" },
];

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value.toLocaleString()}</p>
    </div>
  );
}

export default function AdminGuestActivityPage() {
  const [searchGuest, setSearchGuest] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cartFilter, setCartFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedGuest, setSelectedGuest] = useState<GuestVisitorRow | null>(null);

  const debouncedGuest = useDebounce(searchGuest);
  const debouncedPhone = useDebounce(phoneFilter);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(debouncedGuest ? { guestId: debouncedGuest } : {}),
      ...(debouncedPhone ? { phoneNumber: debouncedPhone } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(cartFilter ? { cartStatus: cartFilter } : {}),
      ...(eventFilter ? { eventType: eventFilter } : {}),
      ...(dateFrom ? { from: dateFrom } : {}),
      ...(dateTo ? { to: dateTo } : {}),
    }),
    [page, debouncedGuest, debouncedPhone, statusFilter, cartFilter, eventFilter, dateFrom, dateTo]
  );

  const summaryQuery = useGuestActivitySummary(
    dateFrom || dateTo ? { from: dateFrom, to: dateTo } : undefined
  );
  const visitorsQuery = useGuestVisitors(queryParams);
  const timelineQuery = useGuestTimeline(selectedGuest?.guestId ?? null, { limit: 50 });

  const summary = summaryQuery.data;
  const visitors = visitorsQuery.data?.visitors ?? [];
  const pagination = visitorsQuery.data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? visitors.length;

  const isLoading = visitorsQuery.isLoading && !visitorsQuery.data;
  const isError = visitorsQuery.isError;

  return (
    <ListPageShell
      isLoading={isLoading}
      isError={isError}
      loadingMessage="Loading guest activity..."
      errorMessage="Failed to load guest activity"
    >
      <PageHeader
        title="Guest activity"
        description="Anonymous visitor tracking, carts, wishlists, and conversion to customers"
      />

      {summary ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <StatTile label="Total visitors" value={summary.totalVisitors} />
          <StatTile label="Active guests" value={summary.uniqueGuests} />
          <StatTile label="Product views" value={summary.guestProductViews} />
          <StatTile label="Cart additions" value={summary.guestCartAdditions} />
          <StatTile label="Conversions" value={summary.guestToCustomerConversions} />
          <StatTile label="Wishlist adds" value={summary.guestWishlistAdditions} />
          <StatTile label="Checkout starts" value={summary.guestCheckoutStarts} />
          <StatTile label="Cart abandonment" value={summary.cartAbandonment} />
        </div>
      ) : null}

      <ListToolbar
        search={searchGuest}
        onSearchChange={(v) => {
          setSearchGuest(v);
          setPage(1);
        }}
        searchPlaceholder="Filter by guest ID..."
        filters={[
          {
            key: "status",
            value: statusFilter,
            placeholder: "All visitors",
            options: STATUS_OPTIONS,
            onChange: (v) => {
              setStatusFilter(v);
              setPage(1);
            },
          },
          {
            key: "cart",
            value: cartFilter,
            placeholder: "Cart status",
            options: CART_OPTIONS,
            onChange: (v) => {
              setCartFilter(v);
              setPage(1);
            },
          },
          {
            key: "event",
            value: eventFilter,
            placeholder: "Activity type",
            options: EVENT_OPTIONS,
            onChange: (v) => {
              setEventFilter(v);
              setPage(1);
            },
          },
        ]}
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          aria-label="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          aria-label="To date"
        />
        <input
          type="search"
          value={phoneFilter}
          onChange={(e) => {
            setPhoneFilter(e.target.value);
            setPage(1);
          }}
          placeholder="Phone number"
          className="min-w-[160px] rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <ListTableCard
        footer={
          <ListPagination
            page={page}
            totalPages={totalPages}
            total={total}
            showing={visitors.length}
            onPageChange={setPage}
            hasNext={pagination?.hasNextPage}
          />
        }
      >
        <table className="admin-table w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Guest ID</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Last activity</th>
              <th className="px-4 py-3 text-left">Cart</th>
              <th className="px-4 py-3 text-left">Wishlist</th>
              <th className="px-4 py-3 text-left">Cart value</th>
              <th className="px-4 py-3 text-left">Last viewed</th>
              <th className="px-4 py-3 text-left">Events</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {visitors.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">
                  No visitor activity yet.
                </td>
              </tr>
            ) : (
              visitors.map((row) => (
                <tr
                  key={row.guestId}
                  className="cursor-pointer border-t hover:bg-gray-50"
                  onClick={() => setSelectedGuest(row)}
                >
                  <td className="px-4 py-3 font-mono text-xs">{row.guestId}</td>
                  <td className="px-4 py-3">
                    {row.customer?.name ?? "—"}
                    {row.customer?.email ? (
                      <p className="text-xs text-muted-foreground">{row.customer.email}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{row.phoneNumber ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(row.lastActivity)}
                  </td>
                  <td className="px-4 py-3">{row.cartItems}</td>
                  <td className="px-4 py-3">{row.wishlistItems}</td>
                  <td className="px-4 py-3">QAR {row.cartValue.toLocaleString()}</td>
                  <td className="max-w-[140px] truncate px-4 py-3">
                    {row.lastViewedProduct ?? "—"}
                  </td>
                  <td className="px-4 py-3">{row.activityCount}</td>
                  <td className="px-4 py-3 capitalize">{row.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ListTableCard>

      <Dialog open={!!selectedGuest} onOpenChange={(open) => !open && setSelectedGuest(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">{selectedGuest?.guestId}</DialogTitle>
          </DialogHeader>
          {selectedGuest ? (
            <div className="space-y-4">
              <p className={adminType.pageDescription}>
                {selectedGuest.customer
                  ? `Linked to ${selectedGuest.customer.name}`
                  : "Anonymous guest"}
                {selectedGuest.phoneNumber ? ` · ${selectedGuest.phoneNumber}` : ""}
              </p>
              {timelineQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading timeline...</p>
              ) : timelineQuery.isError ? (
                <p className="text-sm text-red-600">Could not load timeline.</p>
              ) : (
                <ul className="space-y-2 border-l border-border pl-4">
                  {(timelineQuery.data?.timeline ?? []).map((item) => (
                    <li key={item.id} className="relative text-sm">
                      <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                      <p className="font-medium">
                        {formatGuestTimelineDetail(
                          item.eventType,
                          item.metadata,
                          item.product?.name
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </ListPageShell>
  );
}
