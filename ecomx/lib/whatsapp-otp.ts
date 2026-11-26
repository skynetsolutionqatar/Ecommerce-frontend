/**
 * WhatsApp OTP — Qatar mobiles only. Same rule as SMS (`^974[3567]\d{7}$`).
 * Frontend checks are UX only; the backend validates authoritatively.
 */

export const WHATSAPP_RESEND_SECONDS = 60;
export const WHATSAPP_OTP_TTL_MINUTES = 5;
export const WHATSAPP_LOCAL_LENGTH = 8;
export const WHATSAPP_DIAL_CODE = "974";

export const WHATSAPP_PHONE_ERROR =
  "Enter an 8-digit Qatar mobile number (starts with 3, 5, 6, or 7)";

const QA_LOCAL = /^[3567]\d{7}$/;

/** Keep the 8 national digits. Strips a pasted +974 / 974 / 00974 prefix. */
export function sanitizeWhatsAppNational(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00974")) digits = digits.slice(5);
  else if (digits.startsWith("974") && digits.length > WHATSAPP_LOCAL_LENGTH) digits = digits.slice(3);
  return digits.slice(0, WHATSAPP_LOCAL_LENGTH);
}

/**
 * Accepts `55123456`, `97455123456`, `+97455123456` (spaces allowed).
 * @returns digits-only `974XXXXXXXX`, or null when not a Qatar mobile
 */
export function parseQatarWhatsAppPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (QA_LOCAL.test(digits)) return `${WHATSAPP_DIAL_CODE}${digits}`;
  if (digits.startsWith(WHATSAPP_DIAL_CODE) && QA_LOCAL.test(digits.slice(3))) return digits;
  return null;
}

/** `97455123456` → `+974 5512 3456` for display. */
export function formatWhatsAppPhone(digits: string): string {
  const national = digits.replace(/\D/g, "").replace(/^974/, "");
  if (national.length !== WHATSAPP_LOCAL_LENGTH) return digits ? `+${digits.replace(/\D/g, "")}` : "";
  return `+974 ${national.slice(0, 4)} ${national.slice(4)}`;
}
