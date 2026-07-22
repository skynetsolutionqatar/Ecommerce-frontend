"use client";
import { useState } from "react";
import Avatar from "./Avatar";
import type { StoreUser } from "@/lib/types";
import { tw } from "@/lib/theme";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";
import { getErrorMessage } from "@/lib/utils";
import * as Icons from "./Icons";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (user: StoreUser) => void;
  onLogout?: () => void;
  user?: StoreUser | null;
}

const inputClass =
  "w-full rounded-xl border-[1.5px] border-border bg-bg-soft px-3.5 py-3 text-sm text-primary outline-none transition-[border-color] focus:border-accent";

const iconBtnClass =
  "absolute top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white/12 text-white/85";

const linkBtnClass =
  "cursor-pointer border-0 bg-transparent font-bold text-accent";

export default function LoginModal({ open, onClose, onSuccess, onLogout, user }: LoginModalProps) {

  const router = useRouter();
  const { login, register } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();

  if (!open) return null;

  const displayName = form.name || user?.name || "Guest";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let storeUser: StoreUser;

      if (mode === "register") {
        const result = await register(
          {
            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone || undefined,
          },
          null
        );
        storeUser = { ...result.storeUser, avatarUrl: avatarPreview ?? result.storeUser.avatarUrl };
      } else if (mode === "login") {
        const result = await login({ email: form.email, password: form.password }, null);
        storeUser = { ...result.storeUser, avatarUrl: avatarPreview ?? result.storeUser.avatarUrl };
      } else {
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.(storeUser);
        onClose();
        setForm({ name: "", email: "", phone: "", password: "" });
        setAvatarPreview(undefined);
        setMode("login");
      }, 1400);
    } catch (err) {
      setError(getErrorMessage(err, "Authentication failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onAdminPanelClick = () => {
    onClose();
    router.push("/admin/dashboard");
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 p-6 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[440px] overflow-hidden rounded-[28px] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.2)] animate-fade-up"
      >
        {/* Header with avatar */}
        <div className="relative bg-gradient-to-br from-primary via-primary-mid to-accent px-8 pb-6 pt-7 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar
                name={displayName}
                size={72}
                imageUrl={avatarPreview || user?.avatarUrl}
                className="border-[3px] border-white/25 shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
              />
              {mode === "register" && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-primary bg-accent text-white"
                  title="Upload photo"
                >
                  <Icons.Plus />
                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              )}
            </div>
            <div>
              <div className="mb-1 font-display text-[26px] font-bold text-white">
                {user && !success ? "My Account" : mode === "login" ? "Welcome Back" : mode === "register" ? "Create Account" : "Reset Password"}
              </div>
              <div className="text-[13px] text-white/60">
                {user && !success ? "Manage your Skynet store account" : mode === "login" ? "Sign in to your Skynet account" : mode === "register" ? "Join 1,300+ businesses using Skynet" : "We'll send you a reset link"}
              </div>
            </div>
          </div>
          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`${iconBtnClass} left-4 text-lg`}
              title="Back to Sign In"
            >
              ←
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`${iconBtnClass} right-4`}
            title="Close"
          >
            <Icons.X />
          </button>
        </div>

        <div className="px-8 pb-8 pt-6">
          {user && !success ? (
            <div className="text-center">
              <Avatar name={user.name} size={80} imageUrl={user.avatarUrl} className="mx-auto mb-4" />
              <div className="mb-1 font-display text-xl font-bold text-primary">{user.name}</div>
              <div className="mb-6 text-[13px] text-muted">{user.email}</div>
              <div className="flex flex-col gap-2.5">
                <button className={`${tw.btnPrimary} w-full justify-center`} onClick={onClose}>
                  ← Continue Shopping <Icons.ArrowRight />
                </button>
                <button className={`${tw.btnPrimary} w-full justify-center`} onClick={onAdminPanelClick}>
                  ← Go to Admin Panel <Icons.ArrowRight />
                </button>
                <button
                  className={`${tw.btnOutline} w-full justify-center`}
                  onClick={() => {
                    clearAuth();
                    onLogout?.();
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : success ? (
            <div className="py-5 text-center">
              <Avatar name={displayName} size={64} imageUrl={avatarPreview} className="mx-auto mb-4" />
              <div className="mb-2 text-lg font-bold text-primary">
                {mode === "login" ? "Signed in!" : mode === "register" ? "Account created!" : "Email sent!"}
              </div>
              <div className="text-[13px] text-muted">
                {mode === "forgot" ? "Check your inbox for the reset link." : "Welcome to Skynet Solution Qatar."}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-3.5">
                {mode === "register" && (
                  <FormField label="Full Name" icon={<Icons.User />}>
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Mohammed Al-Thani"
                      required
                      className={inputClass}
                    />
                  </FormField>
                )}

                <FormField label="Email Address" icon={<Icons.Mail />}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@company.com"
                    required
                    className={inputClass}
                  />
                </FormField>

                {mode === "register" && (
                  <FormField label="Phone (Qatar)" icon={<Icons.Phone />}>
                    <input
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+974 XXXX XXXX"
                      className={inputClass}
                    />
                  </FormField>
                )}

                {mode !== "forgot" && (
                  <FormField label="Password" icon={<Icons.Lock />}>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="••••••••"
                        required
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(p => !p)}
                        className="absolute right-3.5 top-1/2 flex -translate-y-1/2 cursor-pointer items-center border-0 bg-transparent text-muted"
                      >
                        {showPass ? <Icons.EyeOff /> : <Icons.Eye />}
                      </button>
                    </div>
                  </FormField>
                )}

                {mode === "login" && (
                  <div className="-mt-1 text-right">
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="cursor-pointer border-0 bg-transparent text-xs font-semibold text-accent"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`${tw.btnPrimary} mt-2 w-full justify-center px-5 py-[15px] text-[15px] disabled:opacity-70`}
                >
                  {loading ? (
                    <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>{mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Send Reset Link"} <Icons.ArrowRight /></>
                  )}
                </button>

                {mode !== "forgot" && (
                  <>
                    <div className="my-1 flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs text-muted">or continue with</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-[1.5px] border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-primary/80 transition-[border-color,box-shadow] hover:border-accent hover:shadow-[0_2px_12px_color-mix(in_srgb,var(--color-accent)_15%,transparent)]"
                      >
                        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#4285F4] text-[11px] font-extrabold text-white">G</span>
                        Google
                      </button>
                      <button
                        type="button"
                        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-[1.5px] border-border bg-bg px-4 py-2.5 text-[13px] font-semibold text-primary transition-[border-color,box-shadow] hover:border-accent hover:shadow-[0_2px_12px_color-mix(in_srgb,var(--color-accent)_15%,transparent)]"
                      >
                        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#0078D4] text-[11px] font-extrabold text-white">M</span>
                        Microsoft
                      </button>
                    </div>
                  </>
                )}

                <div className="text-center text-[13px] text-muted">
                  {mode === "login" ? (
                    <>Don&apos;t have an account?{" "}
                      <button type="button" onClick={() => setMode("register")} className={linkBtnClass}>
                        Register
                      </button>
                    </>
                  ) : mode === "register" ? (
                    <>Already have an account?{" "}
                      <button type="button" onClick={() => setMode("login")} className={linkBtnClass}>
                        Sign In
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setMode("login")} className={linkBtnClass}>
                      ← Back to Sign In
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-primary/80">
        <span className="flex text-accent">{icon}</span> {label}
      </label>
      {children}
    </div>
  );
}
