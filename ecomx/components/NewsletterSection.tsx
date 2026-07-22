"use client";
import { useState } from "react";
import * as Icons from "./Icons";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
  };

  return (
    <section className="mb-2 overflow-hidden" style={{ background: "#f8fafc" }}>
      <div className="w-full py-6 md:py-10">
        <div
          className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-6 shadow-sm sm:px-6 sm:py-8 md:flex-row md:gap-8"
        >
          {/* Icon */}
          <div className="flex shrink-0 items-center justify-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl md:h-20 md:w-20"
              style={{ background: "linear-gradient(135deg, #0a255dff 0%, #374151 100%)" }}
            >
              <svg className="h-8 w-8 text-white md:h-10 md:w-10" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1 text-center md:text-left">
            <h2 className="font-display text-[18px] font-extrabold text-gray-900 md:text-[20px]">
              New Arrivals. Early Access. <span className="italic text-gray-500">Members First.</span>
            </h2>
            <p className="mt-1 font-label text-[12px] text-gray-500">
              Join 120,000+ members who get first access to new drops, exclusive offers, and product updates.
            </p>
          </div>

          {/* Form */}
          <div className="w-full md:w-auto md:min-w-[340px]">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-[13px] text-gray-700 outline-none transition-all focus:border-gray-400 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="shrink-0 rounded-lg px-5 py-3 font-label text-[13px] font-bold text-white transition-all hover:opacity-90 cursor-pointer border-0"
                  style={{ background: "linear-gradient(135deg, #0a255dff, #374151)" }}
                >
                  {loading ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : "Subscribe"}
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                <span className="text-xl">🎉</span>
                <div>
                  <div className="text-[13px] font-bold text-green-800">You&apos;re in!</div>
                  <div className="text-[11px] text-green-600">Check your inbox for a welcome gift.</div>
                </div>
              </div>
            )}
            <p className="mt-2 text-center text-[10.5px] text-gray-400 md:text-left">
              No spam. Unsubscribe anytime. Your data is yours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
