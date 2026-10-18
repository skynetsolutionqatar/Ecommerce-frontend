"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import type { StoreUser } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";
import { canAccessAdminPanel } from "@/lib/config";
import { getAuthErrorMessage } from "@/lib/api/auth-errors";
import { getApiFieldErrors } from "@/lib/api/errors";
import { getRegisterFieldError, normalizeRegisterPhone } from "@/lib/utils";
import AuthFormError from "@/components/auth/AuthFormError";
import {
  initializeGoogleSignIn,
  isGoogleOAuthConfigured,
  loadGoogleIdentityScript,
  promptGoogleSignIn,
} from "@/lib/google-oauth";
import { API_CONFIG } from "@/lib/config";
import * as Icons from "./Icons";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, X } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (user: StoreUser) => void;
  onLogout?: () => void;
  user?: StoreUser | null;
  initialMode?: AuthMode;
  resetToken?: string;
}

type AuthMode = "login" | "register" | "forgot" | "reset";
type RegisterField = "name" | "email" | "phone" | "password";
type ResetField = "newPassword" | "confirmPassword";

const inputClass =
  "w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-all placeholder:text-gray-400 focus:border-[#0a255d] focus:shadow-[0_0_0_4px_rgba(10,37,93,0.12)]";

const primaryBtnClass =
  "group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#061a3d] via-[#0a255d] to-[#1d4ed8] px-5 py-3.5 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(10,37,93,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(10,37,93,0.55)] disabled:translate-y-0 disabled:opacity-70";

const outlineBtnClass =
  "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition-all hover:border-[#0a255d]/40 hover:bg-gray-50 hover:text-[#0a255d]";

const googleBtnClass =
  "group flex w-full items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white px-5 py-3.5 text-[15px] font-bold text-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4285F4]/35 hover:bg-[#fafbff] hover:shadow-[0_8px_24px_rgba(66,133,244,0.18)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70";

export default function LoginModal({
  open,
  onClose,
  onSuccess,
  onLogout,
  user,
  initialMode,
  resetToken = "",
}: LoginModalProps) {
  const router = useRouter();
  const {
    login,
    loginWithGoogle,
    register,
    forgotPassword,
    resetPassword,
    loading,
    clearError,
    setError,
  } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const authUser = useAuthStore((s) => s.user);
  const showAdminPanel = canAccessAdminPanel(authUser?.role);
  const googleClientId = API_CONFIG.googleClientId.trim();

  const [mode, setMode] = useState<AuthMode>("login");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [success, setSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RegisterField, string>>>({});
  const [resetForm, setResetForm] = useState({ newPassword: "", confirmPassword: "" });
  const [resetFieldErrors, setResetFieldErrors] = useState<Partial<Record<ResetField, string>>>({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleCredentialHandlerRef = useRef<(credential: string) => void>(() => {});

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

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      try {
        setGoogleLoading(true);
        clearError();
        const result = await loginWithGoogle(credential, null);
        const storeUser = {
          ...result.storeUser,
          avatarUrl: avatarPreview ?? result.storeUser.avatarUrl,
        };
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSuccess?.(storeUser);
          onClose();
          setForm({ name: "", email: "", phone: "", password: "" });
          setAvatarPreview(undefined);
          switchMode("login");
        }, 1400);
      } catch {
        // useAuth sets auth error
      } finally {
        setGoogleLoading(false);
      }
    },
    [
      avatarPreview,
      clearError,
      loginWithGoogle,
      onClose,
      onSuccess,
    ]
  );

  useEffect(() => {
    googleCredentialHandlerRef.current = (credential) => {
      void handleGoogleCredential(credential);
    };
  }, [handleGoogleCredential]);

  useEffect(() => {
    if (!open || !googleClientId || !isGoogleOAuthConfigured(googleClientId)) return;
    if (mode !== "login" && mode !== "register") return;

    let cancelled = false;

    void loadGoogleIdentityScript()
      .then(() => {
        if (cancelled) return;
        initializeGoogleSignIn(googleClientId, (token) => {
          void googleCredentialHandlerRef.current(token);
        });
      })
      .catch(() => {
        /* handled on button click */
      });

    return () => {
      cancelled = true;
      window.google?.accounts?.id?.cancel();
    };
  }, [open, googleClientId, mode]);

  useEffect(() => {
    if (open && initialMode) {
      setMode(initialMode);
    }
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) {
      setMode(initialMode ?? "login");
      setShowPass(false);
      setForm({ name: "", email: "", phone: "", password: "" });
      setResetForm({ newPassword: "", confirmPassword: "" });
      setSuccess(false);
      setAvatarPreview(undefined);
      setFieldErrors({});
      setResetFieldErrors({});
      setGoogleLoading(false);
      clearError();
    }
  }, [open, clearError, initialMode]);

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
      } else if (mode === "forgot") {
        if (!form.email.trim()) {
          setError("Email is required");
          return;
        }
        await forgotPassword({ email: form.email.trim() });
        setForm((f) => ({ ...f, email: "" }));
        setSuccess(true);
        return;
      } else if (mode === "reset") {
        if (!resetToken) {
          setError("Invalid or missing reset link. Request a new one.");
          return;
        }
        if (resetForm.newPassword !== resetForm.confirmPassword) {
          setResetFieldErrors({ confirmPassword: "Passwords do not match" });
          return;
        }
        await resetPassword({
          token: resetToken,
          newPassword: resetForm.newPassword,
          confirmPassword: resetForm.confirmPassword,
        });
        setResetForm({ newPassword: "", confirmPassword: "" });
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1800);
        return;
      } else {
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
      const apiFieldErrors = getApiFieldErrors(err);
      if (mode === "register") {
        if (Object.keys(apiFieldErrors).length > 0) {
          setFieldErrors(apiFieldErrors);
          clearError();
          return;
        }
        const registerMsg = getAuthErrorMessage(err, "register");
        if (/email is already registered/i.test(registerMsg)) {
          setFieldErrors({ email: registerMsg });
          clearError();
          return;
        }
        if (/phone number is already registered/i.test(registerMsg)) {
          setFieldErrors({ phone: registerMsg });
          clearError();
          return;
        }
      }
      if (mode === "reset" && Object.keys(apiFieldErrors).length > 0) {
        const mappedErrors: Partial<Record<ResetField, string>> = {};
        if (apiFieldErrors.newPassword) mappedErrors.newPassword = apiFieldErrors.newPassword;
        if (apiFieldErrors.confirmPassword) mappedErrors.confirmPassword = apiFieldErrors.confirmPassword;
        if (apiFieldErrors.password) mappedErrors.newPassword = apiFieldErrors.password;
        if (Object.keys(mappedErrors).length > 0) {
          setResetFieldErrors(mappedErrors);
          clearError();
          return;
        }
      }

      const action =
        mode === "register"
          ? "register"
          : mode === "forgot"
            ? "forgotPassword"
            : mode === "reset"
              ? "resetPassword"
              : "login";
      setError(getAuthErrorMessage(err, action));
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    if (!isGoogleOAuthConfigured(googleClientId)) {
      setError(
        "Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID for this storefront deployment."
      );
      return;
    }
    setGoogleLoading(true);
    try {
      await loadGoogleIdentityScript();
      initializeGoogleSignIn(googleClientId, (token) => {
        void googleCredentialHandlerRef.current(token);
      });
      promptGoogleSignIn((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleLoading(false);
        }
      });
    } catch (err) {
      const msg =
        err instanceof Error && err.message.includes("not ready")
          ? "Google sign-in is still loading. Check your network or ad blocker, then try again."
          : err instanceof Error && err.message.includes("Failed to load")
            ? "Could not load Google sign-in (blocked or offline). Allow accounts.google.com and try again."
            : "Could not load Google sign-in. Please try again.";
      setError(msg);
      setGoogleLoading(false);
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
          : mode === "reset"
            ? "New Password"
            : "Reset Password";

  const headerSubtitle =
    user && !success
      ? "Manage your store account"
      : mode === "login"
        ? "Sign in to shop smarter"
        : mode === "register"
          ? "Create your account in seconds"
          : mode === "reset"
            ? "Choose a new password for your account"
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

          {(mode === "forgot" || mode === "reset") && (
            <button
              type="button"
              onClick={() => (initialMode === "reset" ? onClose() : switchMode("login"))}
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
                {!user && mode !== "forgot" && mode !== "reset" && (
                  <Sparkles className="h-5 w-5 text-amber-300" strokeWidth={2.25} />
                )}
              </div>
              <p className="text-[13px] font-medium text-blue-100/80">{headerSubtitle}</p>
            </div>

            {!user && !success && mode !== "forgot" && mode !== "reset" && (
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
                    Go to Dashboard
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
                    : mode === "reset"
                      ? "Password updated!"
                      : "Email sent!"}
              </div>
              <p className="text-sm font-medium text-gray-500">
                {mode === "forgot"
                  ? "Check your inbox for the reset link."
                  : mode === "reset"
                    ? "You can now sign in with your new password."
                    : "Welcome to Skynet Solution Qatar."}
              </p>
            </div>
          ) : mode === "reset" && !resetToken ? (
            <div className="py-4 text-center">
              <p className="mb-4 text-sm font-medium text-gray-600">
                This password reset link is missing or invalid.
              </p>
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className={primaryBtnClass}
              >
                Request New Link
                <ArrowRight className="h-4 w-4" />
              </button>
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
                      placeholder="John Doe"
                      required
                      className={`${inputClass} ${fieldErrors.name ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]" : ""}`}
                    />
                  </FormField>
                )}

                {mode !== "reset" && (
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
                )}

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
                        placeholder="00000000"
                        autoComplete="tel-national"
                        className={`${inputClass} rounded-none border-0 shadow-none focus:shadow-none`}
                      />
                    </div>
                  </FormField>
                )}

                {mode === "login" || mode === "register" ? (
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
                ) : null}

                {mode === "reset" && (
                  <>
                    <FormField label="New Password" icon={<Icons.Lock />} error={resetFieldErrors.newPassword}>
                      <div className="relative">
                        <input
                          type={showPass ? "text" : "password"}
                          value={resetForm.newPassword}
                          onChange={(e) => {
                            setResetFieldErrors((prev) => {
                              if (!prev.newPassword) return prev;
                              const next = { ...prev };
                              delete next.newPassword;
                              return next;
                            });
                            setResetForm((f) => ({ ...f, newPassword: e.target.value }));
                          }}
                          placeholder="Enter new password"
                          required
                          autoComplete="new-password"
                          className={`${inputClass} pr-12 ${resetFieldErrors.newPassword ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]" : ""}`}
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
                    <FormField label="Confirm New Password" icon={<Icons.Lock />} error={resetFieldErrors.confirmPassword}>
                      <input
                        type={showPass ? "text" : "password"}
                        value={resetForm.confirmPassword}
                        onChange={(e) => {
                          setResetFieldErrors((prev) => {
                            if (!prev.confirmPassword) return prev;
                            const next = { ...prev };
                            delete next.confirmPassword;
                            return next;
                          });
                          setResetForm((f) => ({ ...f, confirmPassword: e.target.value }));
                        }}
                        placeholder="Re-enter new password"
                        required
                        autoComplete="new-password"
                        className={`${inputClass} ${resetFieldErrors.confirmPassword ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]" : ""}`}
                      />
                    </FormField>
                  </>
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
                          : mode === "reset"
                            ? "Update Password"
                            : "Send Reset Link"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>

                {mode !== "forgot" && mode !== "reset" && (
                  <>
                    <div className="flex items-center gap-3 py-1">
                      <div className="h-px flex-1 bg-gray-200" />
                      <span className="text-[13px] md:text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        or continue with
                      </span>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      <button
                        type="button"
                        disabled={loading || googleLoading}
                        onClick={handleGoogleSignIn}
                        className={googleBtnClass}
                      >
                        {googleLoading ? (
                          <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-[#4285F4]/25 border-t-[#4285F4]" />
                        ) : (
                          <>
                            <GoogleIcon />
                            {mode === "login" ? "Sign in with Google" : "Continue with Google"}
                          </>
                        )}
                      </button>
                      {/* Microsoft sign-in — hidden until OAuth is implemented
                      <button
                        type="button"
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-[13px] font-bold text-gray-800 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
                      >
                        <span className="flex h-7 w-7 md:h-6 md:w-6 items-center justify-center rounded-full bg-[#0078D4] text-[12px] md:text-[10px] font-black text-white">
                          M
                        </span>
                        Microsoft
                      </button>
                      */}
                    </div>
                  </>
                )}

                {(mode === "forgot" || mode === "reset") && (
                  <p className="text-center text-[13px] font-medium text-gray-500">
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={() => (initialMode === "reset" ? onClose() : switchMode("login"))}
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

function GoogleIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
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
