import { linkGuestActivity, saveGuestPhone } from "@/lib/api/guest-activity.api";
import { flushGuestActivityQueue } from "@/lib/store/guest-activity-tracker";
import { getGuestId } from "@/lib/store/guest-id";

export async function linkGuestActivityToCustomer(
  linkType: "login_linked" | "register_linked" = "login_linked"
) {
  const guestId = getGuestId();
  if (!guestId) return;

  await flushGuestActivityQueue();
  try {
    await linkGuestActivity({ guestId, linkType });
  } catch {
    // Non-blocking — cart/wishlist merge still succeeds
  }
}

export async function submitGuestPhone(phoneNumber: string) {
  const guestId = getGuestId();
  if (!guestId || !phoneNumber.trim()) return;

  await flushGuestActivityQueue();
  try {
    await saveGuestPhone({ guestId, phoneNumber: phoneNumber.trim() });
  } catch {
    // optional capture — ignore failures
  }
}
