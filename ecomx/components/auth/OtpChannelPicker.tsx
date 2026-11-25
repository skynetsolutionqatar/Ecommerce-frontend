"use client";

import * as Icons from "@/components/Icons";

const choiceClass =
  "flex min-h-[52px] w-full items-center gap-3 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-left text-sm font-bold text-gray-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:border-[#0a255d]/40 hover:bg-[#f7f9ff] hover:text-[#0a255d]";

export type OtpChannel = "sms" | "email";

export default function OtpChannelPicker({
  onSelect,
}: {
  onSelect: (channel: OtpChannel) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-gray-600">
        Choose how to receive your one-time code. A new email gets an account automatically.
      </p>
      <button type="button" onClick={() => onSelect("sms")} className={choiceClass}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0a255d]/10 text-[#0a255d]">
          <Icons.Phone />
        </span>
        <span className="min-w-0">
          <span className="block">Text message</span>
          <span className="block text-xs font-medium text-gray-500">Qatar or India mobile number</span>
        </span>
      </button>
      <button type="button" onClick={() => onSelect("email")} className={choiceClass}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0a255d]/10 text-[#0a255d]">
          <Icons.Mail />
        </span>
        <span className="min-w-0">
          <span className="block">Email</span>
          <span className="block text-xs font-medium text-gray-500">Code sent to your inbox</span>
        </span>
      </button>
    </div>
  );
}
