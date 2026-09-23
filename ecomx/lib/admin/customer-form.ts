import * as Yup from "yup";
import { ROLE } from "@/lib/Constant";
import type { ApiCustomer, UpdateCustomerPayload } from "@/types/customer.types";

export interface CustomerFormValues {
  name: string;
  phone: string;
  isAdmin: boolean;
}

export const customerValidationSchema = Yup.object({
  name: Yup.string().trim().min(2, "Name must be at least 2 characters").max(50).required("Name is required"),
  phone: Yup.string().trim().max(20),
  isAdmin: Yup.boolean().required(),
});

export function toCustomerFormValues(customer: ApiCustomer): CustomerFormValues {
  return {
    name: customer.name,
    phone: customer.phone ?? "",
    isAdmin: customer.role === ROLE.ADMIN || customer.role === ROLE.SUPERADMIN,
  };
}

export function toUpdateCustomerPayload(values: CustomerFormValues): UpdateCustomerPayload {
  return {
    name: values.name.trim(),
    phone: values.phone.trim(),
    isAdmin: values.isAdmin,
  };
}

export function isCustomerRoleLocked(customer: ApiCustomer): boolean {
  return customer.role === ROLE.SUPERADMIN;
}
