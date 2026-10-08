import { isDeveloperRole, isOwnerRole, isPlatformRole } from "@/lib/Constant";

/** Platform-only: create stores and copy tenant IDs for client frontends. */
export function canManageTenants(role?: string): boolean {
  return isDeveloperRole(role) || isOwnerRole(role) || role === "superadmin";
}

export function isPlatformAdmin(role?: string): boolean {
  return isPlatformRole(role);
}
