import { authApi } from "@/lib/api/auth.api";
import {
  isMsg91WidgetConfigured,
  prepareMsg91Widget,
  widgetRetryOtp,
  widgetSendOtp,
} from "@/lib/msg91-widget.client";

export type OtpDelivery = "widget" | "server";

export type OtpChallenge = {
  reqId: string;
  via: OtpDelivery;
};

function requireReqId(reqId: string | undefined, fallback: string): string {
  const value = reqId?.trim();
  if (!value) throw new Error(fallback);
  return value;
}

async function serverSend(identifier: string): Promise<string> {
  const res = await authApi.sendPhoneOtp({ phone: identifier });
  return requireReqId(res.data?.reqId, "Verification did not start. Please try again.");
}

async function serverResend(reqId: string): Promise<string> {
  const res = await authApi.resendPhoneOtp({ reqId });
  return requireReqId(res.data?.reqId, "Could not resend the code. Please try again.");
}

let otpInFlight = false;

function beginOtpRequest(): void {
  if (otpInFlight) {
    throw new Error("A verification code is already being sent.");
  }
  otpInFlight = true;
}

/**
 * Send a login code.
 * The browser widget is used when its public id and token are set, because
 * MSG91 turns captcha on by default and the server API cannot solve it.
 * Otherwise the storefront calls POST /auth/msg91/send-otp.
 */
export async function sendLoginOtp(identifier: string): Promise<OtpChallenge> {
  beginOtpRequest();
  try {
    if (isMsg91WidgetConfigured()) {
      await prepareMsg91Widget();
      const reqId = await widgetSendOtp(identifier);
      return { reqId, via: "widget" };
    }

    const reqId = await serverSend(identifier);
    return { reqId, via: "server" };
  } finally {
    otpInFlight = false;
  }
}

export async function resendLoginOtp(challenge: OtpChallenge): Promise<OtpChallenge> {
  beginOtpRequest();
  try {
    if (challenge.via === "widget") {
      await prepareMsg91Widget();
      const reqId = await widgetRetryOtp(challenge.reqId);
      return { reqId, via: "widget" };
    }

    const reqId = await serverResend(challenge.reqId);
    return { reqId, via: "server" };
  } finally {
    otpInFlight = false;
  }
}
