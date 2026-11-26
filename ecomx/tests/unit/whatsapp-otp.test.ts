import { describe, expect, it } from "vitest";
import {
  formatWhatsAppPhone,
  parseQatarWhatsAppPhone,
  sanitizeWhatsAppNational,
  WHATSAPP_RESEND_SECONDS,
} from "@/lib/whatsapp-otp";

describe("parseQatarWhatsAppPhone", () => {
  it("accepts Qatar mobiles in local, international and E.164 form", () => {
    expect(parseQatarWhatsAppPhone("55123456")).toBe("97455123456");
    expect(parseQatarWhatsAppPhone("97455123456")).toBe("97455123456");
    expect(parseQatarWhatsAppPhone("+97455123456")).toBe("97455123456");
    expect(parseQatarWhatsAppPhone("+974 5512 3456")).toBe("97455123456");
    for (const prefix of ["3", "5", "6", "7"]) {
      expect(parseQatarWhatsAppPhone(`${prefix}5123456`)).toBe(`974${prefix}5123456`);
    }
  });

  it("rejects other countries, wrong lengths and prefixes", () => {
    for (const bad of [
      "",
      "919876543210",
      "9876543210",
      "+447700900123",
      "45123456",
      "85123456",
      "5512345",
      "551234567",
      "9745512345",
      "974551234567",
      "97445123456",
    ]) {
      expect(parseQatarWhatsAppPhone(bad), bad).toBeNull();
    }
  });
});

describe("sanitizeWhatsAppNational", () => {
  it("keeps up to 8 digits", () => {
    expect(sanitizeWhatsAppNational("5512-34ab56")).toBe("55123456");
    expect(sanitizeWhatsAppNational("551234567")).toBe("55123456");
  });

  it("strips a pasted country prefix", () => {
    expect(sanitizeWhatsAppNational("+974 5512 3456")).toBe("55123456");
    expect(sanitizeWhatsAppNational("0097455123456")).toBe("55123456");
  });

  it("does not strip 974 typed as the start of an 8-digit number", () => {
    expect(sanitizeWhatsAppNational("974")).toBe("974");
  });
});

describe("formatWhatsAppPhone", () => {
  it("formats for display", () => {
    expect(formatWhatsAppPhone("97455123456")).toBe("+974 5512 3456");
  });
});

it("uses a 60 second resend cooldown", () => {
  expect(WHATSAPP_RESEND_SECONDS).toBe(60);
});
