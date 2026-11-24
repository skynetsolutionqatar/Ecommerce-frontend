import { API_CONFIG } from "@/lib/config";

export type OtpPhoneCountry = "QA" | "IN";

export const OTP_COUNTRIES: Record<
  OtpPhoneCountry,
  { dial: string; label: string; localLength: number; placeholder: string }
> = {
  QA: { dial: "974", label: "Qatar", localLength: 8, placeholder: "33123456" },
  IN: { dial: "91", label: "India", localLength: 10, placeholder: "9876543210" },
};

const QA_LOCAL = /^[3567]\d{7}$/;
const IN_LOCAL = /^[6-9]\d{9}$/;

export const OTP_RESEND_SECONDS = 30;

export function defaultOtpCountry(): OtpPhoneCountry {
  return API_CONFIG.otpPhoneCountry === "IN" ? "IN" : "QA";
}

export function sanitizeOtpNational(value: string, country: OtpPhoneCountry): string {
  return value.replace(/\D/g, "").slice(0, OTP_COUNTRIES[country].localLength);
}

/** MSG91 identifier: country code + national number, no leading +. */
export function otpIdentifier(national: string, country: OtpPhoneCountry): string | null {
  const local = national.replace(/\D/g, "").replace(/^0+/, "");
  if (country === "QA" && QA_LOCAL.test(local)) return `974${local}`;
  if (country === "IN" && IN_LOCAL.test(local)) return `91${local}`;
  return null;
}

export function otpPhoneError(country: OtpPhoneCountry): string {
  return country === "QA"
    ? "Enter an 8-digit Qatar mobile number (starts with 3, 5, 6, or 7)"
    : "Enter a 10-digit India mobile number (starts with 6, 7, 8, or 9)";
}

export function formatOtpIdentifier(identifier: string): string {
  const digits = identifier.replace(/\D/g, "");
  return digits ? `+${digits}` : identifier;
}

/**
 * If the shopper pastes a full international number, keep the national digits
 * and switch country when the prefix is Qatar or India.
 */
export function applyPastedOtpPhone(
  raw: string,
  country: OtpPhoneCountry
): { country: OtpPhoneCountry; national: string } {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("974") && digits.length > OTP_COUNTRIES.QA.localLength) {
    return { country: "QA", national: sanitizeOtpNational(digits.slice(3), "QA") };
  }
  if (digits.startsWith("91") && digits.length > OTP_COUNTRIES.IN.localLength) {
    return { country: "IN", national: sanitizeOtpNational(digits.slice(2), "IN") };
  }
  return { country, national: sanitizeOtpNational(digits, country) };
}
