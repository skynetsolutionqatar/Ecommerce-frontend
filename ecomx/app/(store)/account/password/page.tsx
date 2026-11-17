import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function AccountPasswordRedirectPage() {
  redirect(`${ROUTES.account}?section=password`);
}
