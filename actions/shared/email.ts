"use server";

import { redis } from "@/lib/redis";
import { resend } from "@/lib/email";
import {
  WelcomeEmailTemplate,
  VerificationEmailTemplate,
  PasswordResetEmailTemplate,
  NewLoginDetectedEmailTemplate,
  ApprovedUserEmailTemplate,
  UserSuspendedEmailTemplate,
  UserUnsuspendedEmailTemplate,
  AssignedSystemAccessEmailTemplate,
  SuspendedSystemAccessEmailTemplate,
  UnsuspendedSystemAccessEmailTemplate,
  UpdatedSystemAccessEmailTemplate,
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
      subject: "Welcome to Our Backstage Dashboard!",
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
    const verificationUrl = `${getBaseUrl()}/auth/verify?token=${token}`;
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
    const resetUrl = `${getBaseUrl()}/auth/reset-password?token=${token}`;
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

export async function sendNewLoginDetectedEmail(
  email: string,
  loginTime: string,
  location: string,
  device: string
): Promise<void> {
  try {
    const dashboardUrl = getBaseUrl();
    const emailHtml = await render(
      NewLoginDetectedEmailTemplate({
        email,
        location,
        loginTime,
        device,
        dashboardUrl,
      })
    );
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "New Login Detected",
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send new login detected email:", error);
  }
}

export async function sendApprovedUserEmail(
  email: string,
  name: string
): Promise<void> {
  try {
    const dashboardUrl = getBaseUrl();
    const emailHtml = await render(
      ApprovedUserEmailTemplate({ name, email, dashboardUrl })
    );
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "Your Account Has Been Approved!",
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send approved user email:", error);
  }
}

export async function sendUserSuspendedEmail(
  email: string,
  name: string
): Promise<void> {
  try {
    const dashboardUrl = getBaseUrl();
    const emailHtml = await render(
      UserSuspendedEmailTemplate({ name, email, dashboardUrl })
    );
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "Your Account Has Been Suspended",
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send user suspended email:", error);
  }
}

export async function sendUserUnsuspendedEmail(
  email: string,
  name: string
): Promise<void> {
  try {
    const dashboardUrl = getBaseUrl();
    const emailHtml = await render(
      UserUnsuspendedEmailTemplate({ name, email, dashboardUrl })
    );
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "Your Account Has Been Restored!",
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send user unsuspended email:", error);
  }
}

export async function sendAssignedSystemAccessEmail(
  userEmail: string,
  userName: string,
  assignerName: string
): Promise<void> {
  try {
    const dashboardUrl = getBaseUrl();
    const emailHtml = await render(
      AssignedSystemAccessEmailTemplate({
        userEmail,
        userName,
        assignerName,
        dashboardUrl,
      })
    );
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: userEmail,
      subject: "You Have Been Granted System Access",
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send assigned system access email:", error);
  }
}

export async function sendSuspendedSystemAccessEmail(
  userEmail: string,
  userName: string
): Promise<void> {
  try {
    const dashboardUrl = getBaseUrl();
    const emailHtml = await render(
      SuspendedSystemAccessEmailTemplate({
        userEmail,
        userName,
        dashboardUrl,
      })
    );
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: userEmail,
      subject: "Your System Access Has Been Suspended",
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send suspended system access email:", error);
  }
}

export async function sendUnsuspendedSystemAccessEmail(
  userEmail: string,
  userName: string
): Promise<void> {
  try {
    const dashboardUrl = getBaseUrl();
    const emailHtml = await render(
      UnsuspendedSystemAccessEmailTemplate({
        userEmail,
        userName,
        dashboardUrl,
      })
    );
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: userEmail,
      subject: "Your System Access Has Been Restored",
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send unsuspended system access email:", error);
  }
}
export async function sendUpdatedSystemAccessEmail(
  userEmail: string,
  userName: string,
  updatedByName: string
): Promise<void> {
  try {
    const dashboardUrl = getBaseUrl();
    const emailHtml = await render(
      UpdatedSystemAccessEmailTemplate({
        userEmail,
        userName,
        updatedByName,
        dashboardUrl,
      })
    );
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: userEmail,
      subject: "Your System Access Has Been Updated",
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send updated system access email:", error);
  }
}
