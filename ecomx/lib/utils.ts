import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  amount: number,
  currency = "QAR",
  locale = "en-QA"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-QA", options).format(d);
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function truncate(str: string, max = 50): string {
  if (str.length <= max) return str;
  return `${str.slice(0, max)}…`;
}

/** Qatar mobile: 8 digits starting with 3, 5, 6, or 7. */
const QATAR_LOCAL_PHONE = /^[3567]\d{7}$/;
const REGISTER_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizeQatarPhoneInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

export function isValidRegisterEmail(email: string): boolean {
  return REGISTER_EMAIL.test(email.trim());
}

export function isValidQatarPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("974") && digits.length === 11) {
    return QATAR_LOCAL_PHONE.test(digits.slice(3));
  }
  return QATAR_LOCAL_PHONE.test(digits);
}

/** Normalize Qatar phone for register API — returns +974XXXXXXXX. */
export function normalizeRegisterPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const local =
    digits.startsWith("974") && digits.length === 11 ? digits.slice(3) : digits;
  if (!QATAR_LOCAL_PHONE.test(local)) {
    throw new Error("Please enter a valid 8-digit Qatar phone number");
  }
  return `+974${local}`;
}

export function getRegisterFieldError(fields: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): string | null {
  if (!fields.name.trim()) return "Name is required";
  if (!isValidRegisterEmail(fields.email)) return "Please enter a valid email address";
  if (!isValidQatarPhone(fields.phone)) {
    return "Enter an 8-digit Qatar mobile number (starts with 3, 5, 6, or 7)";
  }
  if (!fields.password.trim()) return "Password is required";
  return null;
}

import { getApiErrorMessage } from "@/lib/api/errors";

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  return getApiErrorMessage(error, fallback);
}
