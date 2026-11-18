"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { enquiryApi } from "@/lib/api/enquiry.api";
import { getApiFieldErrors } from "@/lib/api/errors";
import { showError, showSuccess } from "@/lib/toast";
import { useAuthStore } from "@/store/auth.store";
import { Colors } from "@/lib/theme";

interface QuoteRequestModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  users: string;
  message: string;
  website: string; // honeypot
};

const QATAR_PHONE = /^\+974[\s-]?\d{4}[\s-]?\d{4}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(f: FormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.name.trim()) e.name = "Name is required";
  if (!EMAIL.test(f.email.trim())) e.email = "Enter a valid email";
  if (!QATAR_PHONE.test(f.phone.trim())) e.phone = "Enter a Qatar number: +974 followed by 8 digits";
  if (!f.company.trim()) e.company = "Company name is required";
  if (f.users && !(Number(f.users) >= 1)) e.users = "Enter a valid number";
  return e;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-[14px] outline-none focus:border-blue-600";

export default function QuoteRequestModal({ open, onClose, productId, productName }: QuoteRequestModalProps) {
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState<FormState>({
    name: "", email: "", phone: "", company: "", users: "", message: "", website: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Prefill from the logged-in profile each time the modal opens (editable). Company stays blank.
  useEffect(() => {
    if (!open) return;
    setForm((f) => ({
      ...f,
      name: f.name || user?.name || "",
      email: f.email || user?.email || "",
      phone: f.phone || user?.phone || "",
    }));
  }, [open, user]);

  // Close on Escape and lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await enquiryApi.create({
        productId,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company: form.company.trim(),
        users: form.users ? Number(form.users) : undefined,
        message: form.message.trim() || undefined,
        website: form.website,
      });
      showSuccess("Quote request sent. We will contact you shortly.");
      setForm((f) => ({ ...f, company: "", users: "", message: "" }));
      onClose();
    } catch (err) {
      const fieldErrors = getApiFieldErrors(err);
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      showError(err, "Could not send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const field = (
    key: keyof FormState,
    label: string,
    opts: { required?: boolean; type?: string; placeholder?: string } = {}
  ) => (
    <div>
      <label className="mb-1 block text-[13px] font-semibold text-gray-700">
        {label}
        {opts.required ? <span className="text-red-500"> *</span> : null}
      </label>
      <input
        className={inputClass}
        type={opts.type ?? "text"}
        value={form[key]}
        placeholder={opts.placeholder}
        onChange={set(key)}
      />
      {errors[key] ? <p className="mt-1 text-[12px] text-red-600">{errors[key]}</p> : null}
    </div>
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer border-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Request a Quote"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          <X size={16} />
        </button>
        <div className="mb-4 pr-8">
          <h2 className="text-[18px] font-bold text-gray-900">Request a Quote</h2>
          <p className="mt-0.5 text-[13px] text-gray-500">{productName}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          {field("name", "Full name", { required: true })}
          {field("email", "Email", { required: true, type: "email" })}
          {field("phone", "Phone", { required: true, type: "tel", placeholder: "+974 5555 1234" })}
          {field("company", "Company name", { required: true })}
          {field("users", "Number of users / licenses", { type: "number", placeholder: "Optional" })}
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-gray-700">
              What do you need?
            </label>
            <textarea
              className={inputClass}
              rows={4}
              maxLength={3000}
              value={form.message}
              placeholder="Tell us your requirements (optional)"
              onChange={set("message")}
            />
          </div>

          {/* Honeypot: hidden from people, bots fill it */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={form.website}
            onChange={set("website")}
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 min-h-[44px] cursor-pointer rounded-lg border-0 px-4 py-3 text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: Colors.base_color }}
          >
            {submitting ? "Sending..." : "Send Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
