"use client";

import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import type { StoreUser } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";
import { isAdminRole } from "@/lib/config";
import { getAuthErrorMessage } from "@/lib/api/auth-errors";
import { getApiFieldErrors } from "@/lib/api/errors";
import { getRegisterFieldError, normalizeRegisterPhone } from "@/lib/utils";
import AuthFormError from "@/components/auth/AuthFormError";
import * as Icons from "./Icons";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, X } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (user: StoreUser) => void;
  onLogout?: () => void;
  user?: StoreUser | null;
}

type AuthMode = "login" | "register" | "forgot";
type RegisterField = "name" | "email" | "phone" | "password";

const inputClass =
  "w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-all placeholder:text-gray-400 focus:border-[#0a255d] focus:shadow-[0_0_0_4px_rgba(10,37,93,0.12)]";

const primaryBtnClass =
  "group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#061a3d] via-[#0a255d] to-[#1d4ed8] px-5 py-3.5 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(10,37,93,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(10,37,93,0.55)] disabled:translate-y-0 disabled:opacity-70";

const outlineBtnClass =
  "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition-all hover:border-[#0a255d]/40 hover:bg-gray-50 hover:text-[#0a255d]";

export default function LoginModal({
  open,
  onClose,
  onSuccess,
  onLogout,
  user,
}: LoginModalProps) {
  const router = useRouter();
  const { login, register, forgotPassword, loading, clearError, setError } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const authUser = useAuthStore((s) => s.user);
  const showAdminPanel = isAdminRole(authUser?.role);

  const [mode, setMode] = useState<AuthMode>("login");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [success, setSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RegisterField, string>>>({});

  const clearFieldError = (field: RegisterField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const switchMode = (next: AuthMode) => {
    clearError();
    setFieldErrors({});
    setSuccess(false);
    setMode(next);
  };

  useEffect(() => {
    if (!open) {
      setMode("login");
      setShowPass(false);
      setForm({ name: "", email: "", phone: "", password: "" });
      setSuccess(false);
      setAvatarPreview(undefined);
      setFieldErrors({});
      clearError();
    }
  }, [open, clearError]);

  if (!open) return null;

  const displayName = form.name || user?.name || "Guest";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFieldErrors({});

    try {
      let storeUser: StoreUser;

      if (mode === "register") {
        const validationError = getRegisterFieldError(form);
        if (validationError) {
          setError(validationError);
          return;
        }

        const result = await register(
          {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            phone: normalizeRegisterPhone(form.phone),
          },
          null
        );
        storeUser = { ...result.storeUser, avatarUrl: avatarPreview ?? result.storeUser.avatarUrl };
      } else if (mode === "login") {
        const result = await login({ email: form.email, password: form.password }, null);
        storeUser = { ...result.storeUser, avatarUrl: avatarPreview ?? result.storeUser.avatarUrl };
      } else {
        if (!form.email.trim()) {
          setError("Email is required");
          return;
        }
        await forgotPassword({ email: form.email.trim() });
        setForm((f) => ({ ...f, email: "" }));
        setSuccess(true);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.(storeUser);
        onClose();
        setForm({ name: "", email: "", phone: "", password: "" });
        setAvatarPreview(undefined);
        switchMode("login");
      }, 1400);
    } catch (err) {
      const apiFieldErrors = mode === "register" ? getApiFieldErrors(err) : {};
      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors(apiFieldErrors);
        clearError();
        return;
      }

      const action =
        mode === "register" ? "register" : mode === "forgot" ? "forgotPassword" : "login";
      setError(getAuthErrorMessage(err, action));
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
  };

  const headerTitle =
    user && !success
      ? "My Account"
      : mode === "login"
        ? "Welcome Back"
        : mode === "register"
          ? "Join Skynet"
          : "Reset Password";

  const headerSubtitle =
    user && !success
      ? "Manage your store account"
      : mode === "login"
        ? "Sign in to shop smarter"
        : mode === "register"
          ? "Create your account in seconds"
          : "We'll email you a reset link";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[500] flex items-center justify-center bg-[#030712]/75 p-4 backdrop-blur-xl animate-fade-in sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[460px] overflow-hidden rounded-[24px] border border-white/10 bg-white shadow-[0_40px_100px_rgba(0,0,0,0.45)] animate-fade-up"
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#030712] via-[#0a255d] to-[#1e40af] px-6 pb-6 pt-6 text-white sm:px-8">
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:32px_32px]" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="absolute left-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              title="Back to Sign In"
            >
              ←
            </button>
          )}

          <div className="relative flex flex-col items-center gap-4 pt-2 text-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-white/40 to-blue-300/30 blur-sm" />
              <Avatar
                name={displayName}
                size={76}
                imageUrl={avatarPreview || user?.avatarUrl}
                className="relative border-[3px] border-white/30 shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
              />
              {mode === "register" && !user && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-0.5 -right-0.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-[#0a255d] bg-white text-[#0a255d] shadow-lg"
                  title="Upload photo"
                >
                  <Icons.Plus />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-center gap-2 font-display text-[26px] font-bold tracking-tight">
                {headerTitle}
                {!user && mode !== "forgot" && (
                  <Sparkles className="h-5 w-5 text-amber-300" strokeWidth={2.25} />
                )}
              </div>
              <p className="text-[13px] font-medium text-blue-100/80">{headerSubtitle}</p>
            </div>

            {!user && !success && mode !== "forgot" && (
              <div className="flex w-full max-w-[280px] rounded-xl border border-white/20 bg-black/20 p-1 backdrop-blur-sm">
                {(["login", "register"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      switchMode(tab);
                      setError(null);
                    }}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                      mode === tab
                        ? "bg-white text-[#0a255d] shadow-md"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {tab === "login" ? "Sign In" : "Register"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="bg-gradient-to-b from-gray-50 to-white px-6 pb-7 pt-6 sm:px-8">
          {user && !success ? (
            <div className="text-center">
              <Avatar
                name={user.name}
                size={80}
                imageUrl={user.avatarUrl}
                className="mx-auto mb-4 border-2 border-gray-100 shadow-lg"
              />
              <div className="mb-1 font-display text-xl font-bold text-gray-900">{user.name}</div>
              <div className="mb-6 text-[13px] font-medium text-gray-500">{user.email}</div>
              <div className="flex flex-col gap-2.5">
                <button type="button" className={primaryBtnClass} onClick={onClose}>
                  Continue Shopping
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                {showAdminPanel && (
                  <button type="button" className={primaryBtnClass} onClick={onAdminPanelClick}>
                    Go to Admin Panel
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  className={outlineBtnClass}
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
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
                <Icons.Check />
              </div>
              <div className="mb-2 text-xl font-bold text-gray-900">
                {mode === "login"
                  ? "Signed in!"
                  : mode === "register"
                    ? "Account created!"
                    : "Email sent!"}
              </div>
              <p className="text-sm font-medium text-gray-500">
                {mode === "forgot"
                  ? "Check your inbox for the reset link."
                  : "Welcome to Skynet Solution Qatar."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <AuthFormError />

                {mode === "register" && (
                  <FormField label="Full Name" icon={<Icons.User />} error={fieldErrors.name}>
                    <input
                      value={form.name}
                      onChange={(e) => {
                        clearFieldError("name");
                        setForm((f) => ({ ...f, name: e.target.value }));
                      }}
                      placeholder="Mohammed Al-Thani"
                      required
                      className={`${inputClass} ${fieldErrors.name ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]" : ""}`}
                    />
                  </FormField>
                )}

                <FormField
                  label="Email Address"
                  icon={<Icons.Mail />}
                  error={mode === "register" ? fieldErrors.email : undefined}
                >
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      if (mode === "register") clearFieldError("email");
                      setForm((f) => ({ ...f, email: e.target.value }));
                    }}
                    placeholder="you@company.com"
                    required
                    className={`${inputClass} ${mode === "register" && fieldErrors.email ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]" : ""}`}
                  />
                </FormField>

                {mode === "register" && (
                  <FormField label="Phone (Qatar)" icon={<Icons.Phone />} error={fieldErrors.phone}>
                    <div
                      className={`flex overflow-hidden rounded-xl border bg-white ${
                        fieldErrors.phone ? "border-red-400 focus-within:border-red-400" : "border-gray-200 focus-within:border-blue-500"
                      }`}
                    >
                      <span className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700">
                        +974
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        required
                        maxLength={8}
                        value={form.phone}
                        onChange={(e) => {
                          clearFieldError("phone");
                          setForm((f) => ({
                            ...f,
                            phone: e.target.value.replace(/\D/g, "").slice(0, 8),
                          }));
                        }}
                        placeholder="51882350"
                        autoComplete="tel-national"
                        className={`${inputClass} rounded-none border-0 shadow-none focus:shadow-none`}
                      />
                    </div>
                  </FormField>
                )}

                {mode !== "forgot" && (
                  <FormField
                    label="Password"
                    icon={<Icons.Lock />}
                    error={mode === "register" ? fieldErrors.password : undefined}
                  >
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => {
                          if (mode === "register") clearFieldError("password");
                          setForm((f) => ({ ...f, password: e.target.value }));
                        }}
                        placeholder="Enter your password"
                        required
                        className={`${inputClass} pr-12 ${mode === "register" && fieldErrors.password ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((p) => !p)}
                        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#0a255d]"
                        aria-label={showPass ? "Hide password" : "Show password"}
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
                      onClick={() => switchMode("forgot")}
                      className="cursor-pointer border-0 bg-transparent text-sm md:text-xs font-bold text-[#0a255d] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button type="submit" disabled={loading} className={primaryBtnClass}>
                  {loading ? (
                    <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      {mode === "login"
                        ? "Sign In"
                        : mode === "register"
                          ? "Create Account"
                          : "Send Reset Link"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>

                {mode !== "forgot" && (
                  <>
                    <div className="flex items-center gap-3 py-1">
                      <div className="h-px flex-1 bg-gray-200" />
                      <span className="text-[13px] md:text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        or continue with
                      </span>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-[13px] font-bold text-gray-800 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
                      >
                        <span className="flex h-7 w-7 md:h-6 md:w-6 items-center justify-center rounded-full bg-[#4285F4] text-[12px] md:text-[10px] font-black text-white">
                          G
                        </span>
                        Google
                      </button>
                      <button
                        type="button"
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-[13px] font-bold text-gray-800 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
                      >
                        <span className="flex h-7 w-7 md:h-6 md:w-6 items-center justify-center rounded-full bg-[#0078D4] text-[12px] md:text-[10px] font-black text-white">
                          M
                        </span>
                        Microsoft
                      </button>
                    </div>
                  </>
                )}

                {mode === "forgot" && (
                  <p className="text-center text-[13px] font-medium text-gray-500">
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="cursor-pointer border-0 bg-transparent font-bold text-[#0a255d] hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-[13px] md:text-[11px] font-bold uppercase tracking-wider text-gray-600">
        <span className="flex text-[#0a255d]">{icon}</span>
        {label}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
