import type { StoreUser } from "@/lib/types";
import type { AuthUser } from "@/types/auth.types";

export function authUserToStoreUser(user: AuthUser): StoreUser {
  return {
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar,
  };
}
