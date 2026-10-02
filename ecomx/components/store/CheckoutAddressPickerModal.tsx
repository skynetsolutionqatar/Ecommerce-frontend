"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import CustomerAddressForm from "@/components/store/CustomerAddressForm";
import { formatCustomerAddressLines } from "@/lib/store/customer-address-checkout";
import {
  useCustomerAddressMutations,
  useCustomerAddresses,
} from "@/hooks/useCustomerAddresses";
import type { CustomerAddress } from "@/types/customer.types";
import { showSuccess } from "@/lib/toast";
import { Colors, tw } from "@/lib/theme";

interface CheckoutAddressPickerModalProps {
  open: boolean;
  selectedId?: string | null;
  defaultFullName?: string;
  defaultPhone?: string;
  onClose: () => void;
  onSelect: (address: CustomerAddress) => void;
}

export default function CheckoutAddressPickerModal({
  open,
  selectedId,
  defaultFullName = "",
  defaultPhone = "",
  onClose,
  onSelect,
}: CheckoutAddressPickerModalProps) {
  const { data: addresses = [], isLoading } = useCustomerAddresses();
  const { addAddress } = useCustomerAddressMutations();
  const [mode, setMode] = useState<"list" | "add">("list");
  const [pendingId, setPendingId] = useState<string | null>(selectedId ?? null);

  const sorted = useMemo(() => {
    return [...addresses].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });
  }, [addresses]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const confirmSelection = () => {
    const picked = sorted.find((a) => a._id === pendingId);
    if (!picked) return;
    onSelect(picked);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[400] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[min(92dvh,640px)] w-full max-w-lg min-h-0 flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-h-[min(90vh,640px)] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-address-picker-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 sm:px-5">
          <h2
            id="checkout-address-picker-title"
            className="min-w-0 flex-1 text-sm font-bold leading-snug text-gray-900 sm:text-base"
          >
            {mode === "add" ? "Add delivery address" : "Choose delivery address"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {mode === "add" ? (
            <CustomerAddressForm
              defaultFullName={defaultFullName}
              defaultPhone={defaultPhone}
              showDefaultToggle={addresses.length > 0}
              submitLabel="Save & use this address"
              onCancel={() => setMode("list")}
              onSubmit={async (payload) => {
                const res = await addAddress.mutateAsync(payload);
                const list = res.data.addresses;
                const created =
                  list.find(
                    (a) =>
                      a.line1 === payload.line1 &&
                      a.fullName === payload.fullName &&
                      a.phone === payload.phone
                  ) ?? list[list.length - 1];
                if (created) {
                  showSuccess("Address saved");
                  onSelect(created);
                  onClose();
                }
              }}
            />
          ) : isLoading ? (
            <p className="text-sm text-gray-500">Loading addresses...</p>
          ) : sorted.length === 0 ? (
            <div className="text-center">
              <p className="mb-4 text-sm text-gray-600">No saved addresses yet.</p>
              <button
                type="button"
                onClick={() => setMode("add")}
                className={`${tw.btnPrimarySm} rounded-lg !px-4 !py-2 text-sm`}
              >
                Add new address
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {sorted.map((address) => {
                const id = address._id ?? "";
                const active = pendingId === id;
                return (
                  <li key={id || formatCustomerAddressLines(address)}>
                    <button
                      type="button"
                      onClick={() => setPendingId(id)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        active ? "bg-gray-50 ring-1" : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={
                        active
                          ? {
                              borderColor: Colors.base_color,
                              boxShadow: `0 0 0 1px ${Colors.base_color}`,
                            }
                          : undefined
                      }
                    >
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        {address.label ? (
                          <span className="text-xs font-bold uppercase text-gray-600">
                            {address.label}
                          </span>
                        ) : null}
                        {address.isDefault ? (
                          <span
                            className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold"
                            style={{ color: Colors.base_color }}
                          >
                            Default
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{address.fullName}</p>
                      <p className="mt-1 text-xs text-gray-600">{address.phone}</p>
                      <p className="mt-2 text-sm leading-snug text-gray-700">
                        {formatCustomerAddressLines(address)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {mode === "list" && sorted.length > 0 ? (
          <div className="flex shrink-0 flex-col gap-2 border-t border-gray-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:px-5">
            <button
              type="button"
              onClick={() => setMode("add")}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              + Add new address
            </button>
            <button
              type="button"
              disabled={!pendingId}
              onClick={confirmSelection}
              className={`${tw.btnPrimarySm} flex-1 rounded-lg !py-2.5 text-sm disabled:opacity-50`}
            >
              Deliver here
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
