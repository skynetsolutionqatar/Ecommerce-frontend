import { apiGet, apiPost } from "./client";
import type {
  AuthResponse,
  AuthUser,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  EmailOtpChallenge,
  EmailOtpSendPayload,
  EmailOtpVerifyPayload,
  PhoneOtpChallenge,
  PhoneOtpSendPayload,
  PhoneOtpVerifyPayload,
  RegisterPayload,
  ResetPasswordPayload,
  WhatsAppOtpChallenge,
  WhatsAppOtpSendPayload,
  WhatsAppOtpVerifyPayload,
} from "@/types/auth.types";

export const authApi = {
  login: (payload: LoginPayload) =>
    apiPost<AuthResponse>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    apiPost<AuthResponse>("/auth/register", payload),

  logout: () => apiPost<Record<string, never>>("/auth/logout"),

  getMe: () => apiGet<{ customer: AuthUser }>("/auth/me"),

  refresh: (refreshToken: string) =>
    apiPost<{ accessToken: string; refreshToken: string }>("/auth/refresh", {
      refreshToken,
    }),

  changePassword: (payload: ChangePasswordPayload) =>
    apiPost<Record<string, never>>("/auth/change-password", payload),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiPost<{ message: string }>("/auth/forgot-password", payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiPost<{ message: string }>("/auth/reset-password", payload),

  googleLogin: (payload: { credential?: string; idToken?: string }) =>
    apiPost<AuthResponse>("/auth/google/login", payload),

  sendPhoneOtp: (payload: PhoneOtpSendPayload) =>
    apiPost<PhoneOtpChallenge>("/auth/msg91/send-otp", payload),

  verifyPhoneOtp: (payload: PhoneOtpVerifyPayload) =>
    apiPost<AuthResponse>("/auth/msg91/verify-otp", payload),

  resendPhoneOtp: (payload: { reqId: string }) =>
    apiPost<PhoneOtpChallenge>("/auth/msg91/resend-otp", payload),

  sendEmailOtp: (payload: EmailOtpSendPayload) =>
    apiPost<EmailOtpChallenge>("/auth/email-otp/send", payload),

  verifyEmailOtp: (payload: EmailOtpVerifyPayload) =>
    apiPost<AuthResponse>("/auth/email-otp/verify", payload),

  resendEmailOtp: (payload: { challengeId: string }) =>
    apiPost<EmailOtpChallenge>("/auth/email-otp/resend", payload),

  sendWhatsAppOtp: (payload: WhatsAppOtpSendPayload) =>
    apiPost<WhatsAppOtpChallenge>("/auth/whatsapp-otp/send", payload),

  verifyWhatsAppOtp: (payload: WhatsAppOtpVerifyPayload) =>
    apiPost<AuthResponse>("/auth/whatsapp-otp/verify", payload),

  resendWhatsAppOtp: (payload: { challengeId: string }) =>
    apiPost<WhatsAppOtpChallenge>("/auth/whatsapp-otp/resend", payload),
};
