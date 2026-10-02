import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function AccountAddressesRedirectPage() {
  redirect(`${ROUTES.account}?section=addresses`);
}
