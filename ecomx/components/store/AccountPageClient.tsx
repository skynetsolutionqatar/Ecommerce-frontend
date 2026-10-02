"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import * as Icons from "@/components/Icons";
import CustomerAddressForm from "@/components/store/CustomerAddressForm";
import StoreAccountLayout from "@/components/store/StoreAccountNav";
import { useStore } from "@/components/StoreProvider";
import { customerApi } from "@/lib/api/customer.api";
import { Colors, tw } from "@/lib/theme";
import { formatCustomerAddressLines } from "@/lib/store/customer-address-checkout";
import {
  CUSTOMER_PROFILE_KEY,
  useCustomerAddressMutations,
  useCustomerAddresses,
} from "@/hooks/useCustomerAddresses";
import { showError, showSuccess } from "@/lib/toast";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  sanitizeQatarPhoneInput,
  isValidQatarPhone,
  normalizeRegisterPhone,
} from "@/lib/utils";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";
import type { CustomerAddress } from "@/types/customer.types";
import type { AuthUser } from "@/types/auth.types";

type AccountSection = "profile" | "addresses";

export default function AccountPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { setLoginOpen } = useStore();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isLoggedIn = useAuthStore(selectIsAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const authUser = useAuthStore((s) => s.user);

  const sectionParam = searchParams.get("section");
  const activeSection: AccountSection =
    sectionParam === "addresses" ? "addresses" : "profile";

  const { data: customer, isLoading: profileLoading } = useQuery({
    queryKey: CUSTOMER_PROFILE_KEY,
    queryFn: async () => {
      const res = await customerApi.getProfile();
      return res.data.customer;
    },
    enabled: isHydrated && isLoggedIn,
  });

  const { data: addresses = [], isLoading: addressesLoading } = useCustomerAddresses();
  const { addAddress, updateAddress, deleteAddress, setDefaultAddress } =
    useCustomerAddressMutations();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const [addressFormMode, setAddressFormMode] = useState<"none" | "add" | "edit">("none");
  const [editAddress, setEditAddress] = useState<CustomerAddress | null>(null);

  if (!isHydrated) {
    return <p className={`${tw.pageTopOffset} py-16 text-center text-sm text-muted`}>Loading...</p>;
  }

  if (!isLoggedIn) {
    return (
      <div className={`${tw.pageTopOffset} mx-auto max-w-lg px-4 py-16 text-center`}>
        <p className="mb-4 text-sm text-muted">Sign in to view your account.</p>
        <button type="button" onClick={() => setLoginOpen(true)} className={tw.btnPrimary}>
          Sign In
        </button>
      </div>
    );
  }

  const startProfileEdit = () => {
    setProfileName(customer?.name ?? "");
    const digits = (customer?.phone ?? "").replace(/\D/g, "");
    setProfilePhone(
      digits.startsWith("974") && digits.length >= 11
        ? sanitizeQatarPhoneInput(digits.slice(3))
        : sanitizeQatarPhoneInput(digits)
    );
    setEditingProfile(true);
  };

  const saveProfile = async () => {
    if (!profileName.trim()) {
      showError("Name is required");
      return;
    }
    if (profilePhone.trim() && !isValidQatarPhone(profilePhone)) {
      showError("Enter a valid 8-digit Qatar mobile number");
      return;
    }
    setProfileSaving(true);
    try {
      const res = await customerApi.updateProfile({
        name: profileName.trim(),
        phone: profilePhone.trim() ? normalizeRegisterPhone(profilePhone) : "",
      });
      const updated = res.data.customer;
      void queryClient.invalidateQueries({ queryKey: CUSTOMER_PROFILE_KEY });
      if (authUser) {
        const next: AuthUser = {
          ...authUser,
          name: updated.name,
          phone: updated.phone,
          avatar: updated.avatar,
        };
        setUser(next);
      }
      showSuccess("Profile updated");
      setEditingProfile(false);
    } catch (err) {
      showError(getApiErrorMessage(err, "Could not update profile"));
    } finally {
      setProfileSaving(false);
    }
  };

  const navActive: AccountSection = activeSection;

  return (
    <div className={`${tw.pageTopOffset} min-h-screen bg-[#f1f3f6] pb-16`}>
      <div className="mx-auto max-w-[1200px] px-4 pt-2 sm:px-6">
        <button type="button" onClick={() => router.back()} className={`${tw.storeBackLink} mb-4`}>
          <Icons.ChevronLeft /> Back
        </button>

        <StoreAccountLayout
          active={navActive}
          userName={customer?.name ?? authUser?.name ?? "User"}
          userEmail={customer?.email ?? authUser?.email}
          avatarUrl={customer?.avatar ?? authUser?.avatar}
        >
            {activeSection === "profile" ? (
              <div className="rounded-sm border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4">
                  <h1 className="text-base font-semibold text-gray-900 sm:text-lg">Profile Information</h1>
                </div>
                {profileLoading || !customer ? (
                  <p className="px-5 py-8 text-sm text-gray-500">Loading profile...</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    <section className="px-4 py-4 sm:px-5 sm:py-5">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-sm font-semibold text-gray-900">Personal Information</h2>
                        {!editingProfile ? (
                          <button
                            type="button"
                            onClick={startProfileEdit}
                            className="text-sm font-semibold"
                            style={{ color: Colors.base_color }}
                          >
                            Edit
                          </button>
                        ) : null}
                      </div>
                      {editingProfile ? (
                        <div className="flex max-w-md flex-col gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">
                              Full name
                            </label>
                            <input
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">
                              Mobile (+974)
                            </label>
                            <input
                              value={profilePhone}
                              onChange={(e) =>
                                setProfilePhone(sanitizeQatarPhoneInput(e.target.value))
                              }
                              maxLength={8}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="flex flex-col-reverse gap-2 sm:flex-row">
                            <button
                              type="button"
                              onClick={() => setEditingProfile(false)}
                              className={`${tw.btnOutline} w-full flex-1 justify-center text-sm sm:w-auto`}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={profileSaving}
                              onClick={() => void saveProfile()}
                              className={`${tw.btnPrimary} w-full flex-1 justify-center text-sm disabled:opacity-50 sm:w-auto`}
                            >
                              {profileSaving ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <dl className="grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <dt className="text-gray-500">Name</dt>
                            <dd className="font-semibold text-gray-900">{customer.name}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Mobile</dt>
                            <dd className="font-semibold text-gray-900">
                              {customer.phone || "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Member since</dt>
                            <dd className="font-semibold text-gray-900">
                              {customer.createdAt
                                ? new Date(customer.createdAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </dd>
                          </div>
                        </dl>
                      )}
                    </section>

                    <section className="px-4 py-4 sm:px-5 sm:py-5">
                      <h2 className="mb-3 text-sm font-semibold text-gray-900">Email Address</h2>
                      <input
                        readOnly
                        value={customer.email}
                        className="w-full max-w-md rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Email is used for order updates and cannot be changed here.
                      </p>
                    </section>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-sm border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                  <h1 className="text-base font-semibold text-gray-900 sm:text-lg">Manage Addresses</h1>
                  {addressFormMode === "none" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditAddress(null);
                        setAddressFormMode("add");
                      }}
                      className={`${tw.btnPrimarySm} w-full rounded-sm !px-4 !py-2 text-sm sm:w-auto`}
                    >
                      + Add a new address
                    </button>
                  ) : null}
                </div>

                {addressFormMode !== "none" ? (
                  <div className="border-b border-gray-100 px-4 py-4 sm:px-5 sm:py-5">
                    <h2 className="mb-4 text-sm font-semibold text-gray-900">
                      {addressFormMode === "edit" ? "Edit address" : "New address"}
                    </h2>
                    <CustomerAddressForm
                      key={editAddress?._id ?? "new"}
                      initial={editAddress}
                      defaultFullName={customer?.name ?? ""}
                      defaultPhone={customer?.phone ?? ""}
                      showDefaultToggle
                      onCancel={() => {
                        setAddressFormMode("none");
                        setEditAddress(null);
                      }}
                      onSubmit={async (payload) => {
                        if (addressFormMode === "edit" && editAddress?._id) {
                          await updateAddress.mutateAsync({
                            addressId: editAddress._id,
                            payload,
                          });
                          showSuccess("Address updated");
                        } else {
                          await addAddress.mutateAsync(payload);
                          showSuccess("Address added");
                        }
                        setAddressFormMode("none");
                        setEditAddress(null);
                      }}
                    />
                  </div>
                ) : null}

                <div className="px-4 py-4 sm:px-5 sm:py-5">
                  {addressesLoading ? (
                    <p className="text-sm text-gray-500">Loading addresses...</p>
                  ) : addresses.length === 0 && addressFormMode === "none" ? (
                    <p className="text-sm text-gray-600">
                      No saved addresses. Add one to use at checkout.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-4">
                      {addresses.map((address) => (
                        <li
                          key={address._id ?? formatCustomerAddressLines(address)}
                          className="rounded-lg border border-gray-200 p-4"
                        >
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            {address.label ? (
                              <span className="text-xs font-bold uppercase text-gray-600">
                                {address.label}
                              </span>
                            ) : null}
                            {address.isDefault ? (
                              <span
                                className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold"
                                style={{ color: Colors.base_color }}
                              >
                                Default
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{address.fullName}</p>
                          <p className="text-xs text-gray-600">{address.phone}</p>
                          <p className="mt-2 text-sm text-gray-700">
                            {formatCustomerAddressLines(address)}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
                            {!address.isDefault && address._id ? (
                              <button
                                type="button"
                                onClick={() =>
                                  void setDefaultAddress.mutateAsync(address._id!).then(() =>
                                    showSuccess("Default address updated")
                                  )
                                }
                                style={{ color: Colors.base_color }}
                              >
                                Set as default
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => {
                                setEditAddress(address);
                                setAddressFormMode("edit");
                              }}
                              style={{ color: Colors.base_color }}
                            >
                              Edit
                            </button>
                            {address._id ? (
                              <button
                                type="button"
                                className="text-red-600"
                                onClick={async () => {
                                  try {
                                    await deleteAddress.mutateAsync(address._id!);
                                    showSuccess("Address removed");
                                  } catch (err) {
                                    showError(getApiErrorMessage(err, "Could not remove address"));
                                  }
                                }}
                              >
                                Remove
                              </button>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
        </StoreAccountLayout>
      </div>
    </div>
  );
}
