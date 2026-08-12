import { isAdminRole } from "@/lib/Constant";

/** Matches backend authorize(["admin", "superadmin"]) on tenant routes. */
export function canManageTenants(role?: string): boolean {
  return isAdminRole(role);
}
