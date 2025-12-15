"use server";

import { redis } from "@/lib/redis";
import { resend } from "@/lib/email";
import {
  WelcomeEmailTemplate,
  VerificationEmailTemplate,
  PasswordResetEmailTemplate,
} from "@/emails";
import { render } from "@react-email/render";
import { randomBytes } from "crypto";
import { getBaseUrl } from "@/lib/utils";

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<void> {
  try {
    const dashboardUrl = getBaseUrl();
    const emailHtml = await render(
      WelcomeEmailTemplate({ name, email, dashboardUrl })
    );
    const res = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "Welcome to Our Record Label Dashboard!",
      html: emailHtml,
    });
    console.log("Welcome email sent to", email, res);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

export async function sendVerificationEmail(email: string): Promise<void> {
  try {
    const token = randomBytes(16).toString("hex");
    await redis.set(`email_verification_token:${token}`, email, {
      EX: 24 * 60 * 60, // 24 hours
    });
    const expiresIn = "24 hours";
    const verificationUrl = `${getBaseUrl()}/verify-email?token=${token}`;
    const emailHtml = await render(
      VerificationEmailTemplate({ email, expiresIn, verificationUrl })
    );
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "Verify Your Email Address",
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    const token = randomBytes(16).toString("hex");
    await redis.set(`password_reset_token:${token}`, email, {
      EX: 60 * 60, // 1 hour
    });
    const expiresIn = "1 hour";
    const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;
    const emailHtml = await render(
      PasswordResetEmailTemplate({ email, expiresIn, resetUrl })
    );
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "Reset Your Password",
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
}
