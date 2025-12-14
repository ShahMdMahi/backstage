"use server";

import {
  RegisterData,
  ResendVerificationData,
  VerifyEmailData,
  LoginData,
  ForgotPasswordData,
  ResetPasswordData,
  registerSchema,
  resendVerificationSchema,
  verifyEmailSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/validators/auth";
import { prisma } from "@/lib/prisma";
import * as argon2 from "argon2";
import z from "zod";
import { logAuditEvent } from "./audit-log";
import { AUDIT_LOG_ACTION, AUDIT_LOG_ENTITY } from "@/lib/prisma/enums";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "./email";
import { redis } from "@/lib/redis";
import { getDeviceInfo } from "@/lib/device-info";
import { createSession, revokeCurrentSession } from "./session";

/**
 * Register a new user
 * @param data Registration data
 * @returns Result of the registration attempt
 */
export async function register(data: RegisterData): Promise<{
  success: boolean;
  message: string;
  data: null;
  errors: ReturnType<typeof z.treeifyError> | unknown | null;
}> {
  try {
    const validate = await registerSchema.safeParseAsync(data);

    if (!validate.success) {
      return {
        success: false,
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(validate.error),
      };
    }

    const deviceInfo = await getDeviceInfo();

    const userExists = await prisma.$transaction(async (tx) => {
      return await tx.user.findUnique({
        where: {
          email: validate.data.email,
        },
      });
    });

    if (userExists) {
      return {
        success: false,
        message: "User already exists with this email.",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: "Email already in use",
              path: ["email"],
            },
          ])
        ),
      };
    }

    const hashedPassword = await argon2.hash(validate.data.password);

    const newUser = await prisma.$transaction(async (tx) => {
      return await tx.user.create({
        data: {
          name: validate.data.name,
          email: validate.data.email,
          password: hashedPassword,
          phone: validate.data.phone,
        },
      });
    });

    if (!newUser) {
      return {
        success: false,
        message: "User registration failed",
        data: null,
        errors: null,
      };
    }

    try {
      await sendWelcomeEmail(newUser.email, newUser.name);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }

    try {
      await sendVerificationEmail(newUser.email);
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.USER_REGISTERED,
        entity: AUDIT_LOG_ENTITY.USER,
        entityId: newUser.id,
        description: `User ${newUser.email} registered.`,
        metadata: { deviceInfo: JSON.stringify(deviceInfo) },
        user: {
          connect: { id: newUser.id },
        },
      });
    } catch (error) {
      console.error("Failed to log audit event for registration:", error);
    }

    return {
      success: true,
      message: "Registration successful",
      data: null,
      errors: null,
    };
  } catch (error) {
    console.error("Registration failed:", error);
    return {
      success: false,
      message: "Registration failed due to an unexpected error",
      data: null,
      errors: error,
    };
  }
}

/**
 * Resend verification email to a user
 * @param data Resend verification data
 * @returns Result of the resend verification attempt
 */
export async function resendVerification(
  data: ResendVerificationData
): Promise<{
  success: boolean;
  message: string;
  data: null;
  errors: ReturnType<typeof z.treeifyError> | unknown | null;
}> {
  try {
    const validate = await resendVerificationSchema.safeParseAsync(data);

    if (!validate.success) {
      return {
        success: false,
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(validate.error),
      };
    }

    const deviceInfo = await getDeviceInfo();

    const userExists = await prisma.$transaction(async (tx) => {
      return await tx.user.findUnique({
        where: {
          email: validate.data.email,
        },
      });
    });

    if (!userExists) {
      return {
        success: false,
        message: "User with this email not found.",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: "Email not found",
              path: ["email"],
            },
          ])
        ),
      };
    }

    if (userExists.verifiedAt) {
      return {
        success: false,
        message: "User with this email is already verifed",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: "Email is already verified",
              path: ["email"],
            },
          ])
        ),
      };
    }

    try {
      await sendVerificationEmail(userExists.email);
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.USER_RESEND_VERIFICATION,
        entity: AUDIT_LOG_ENTITY.USER,
        entityId: userExists.id,
        description: `Resent verification email to ${userExists.email}.`,
        metadata: { deviceInfo: JSON.stringify(deviceInfo) },
        user: {
          connect: { id: userExists.id },
        },
      });
    } catch (error) {
      console.error(
        "Failed to log audit event for resend verification:",
        error
      );
    }

    return {
      success: true,
      message: "Verification email resent successfully",
      data: null,
      errors: null,
    };
  } catch (error) {
    console.error("Resend verification failed:", error);
    return {
      success: false,
      message: "Resend verification failed due to an unexpected error",
      data: null,
      errors: error,
    };
  }
}

/**
 * Verify user's email
 * @param token Verification token
 * @returns Result of the email verification attempt
 */
export async function verify(data: VerifyEmailData): Promise<{
  success: boolean;
  message: string;
  data: null;
  errors: ReturnType<typeof z.treeifyError> | unknown | null;
}> {
  try {
    const validate = await verifyEmailSchema.safeParseAsync(data);

    if (!validate.success) {
      return {
        success: false,
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(validate.error),
      };
    }

    const deviceInfo = await getDeviceInfo();

    const tokenData = await redis.get(
      `email_verification_token:${validate.data.token}`
    );

    if (!tokenData) {
      return {
        success: false,
        message: "Invalid or expired verfication token",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: "Invalid or expired token",
              path: ["token"],
            },
          ])
        ),
      };
    }

    const userExists = await prisma.$transaction(async (tx) => {
      return await tx.user.findUnique({
        where: {
          email: tokenData,
        },
      });
    });

    if (!userExists) {
      return {
        success: false,
        message: "Unable to find user associated with this token.",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: "User not found",
              path: ["token"],
            },
          ])
        ),
      };
    }

    const verifiedUser = await prisma.$transaction(async (tx) => {
      return await tx.user.update({
        where: {
          id: userExists.id,
        },
        data: {
          verifiedAt: new Date(),
        },
      });
    });

    if (!verifiedUser.verifiedAt) {
      return {
        success: false,
        message: "Email verification failed",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: "Email verification failed",
              path: ["token"],
            },
          ])
        ),
      };
    }

    await redis.del(`email_verification_token:${validate.data.token}`);

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.USER_VERIFIED,
        entity: AUDIT_LOG_ENTITY.USER,
        entityId: verifiedUser.id,
        description: `User ${verifiedUser.email} verified their email.`,
        metadata: { deviceInfo: JSON.stringify(deviceInfo) },
        user: {
          connect: { id: verifiedUser.id },
        },
      });
    } catch (error) {
      console.error("Failed to log audit event for email verification:", error);
    }

    return {
      success: true,
      message: "Email verified successfully",
      data: null,
      errors: null,
    };
  } catch (error) {
    console.error("Email verification failed:", error);
    return {
      success: false,
      message: "Email verification failed due to an unexpected error",
      data: null,
      errors: error,
    };
  }
}

/**
 * Log in a user
 * @param data Login data
 * @returns Result of the login attempt
 */
export async function login(data: LoginData): Promise<{
  success: boolean;
  message: string;
  data: null;
  errors: ReturnType<typeof z.treeifyError> | unknown | null;
}> {
  try {
    const validate = await loginSchema.safeParseAsync(data);

    if (!validate.success) {
      return {
        success: false,
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(validate.error),
      };
    }

    const deviceInfo = await getDeviceInfo();

    const userExists = await prisma.$transaction(async (tx) => {
      return await tx.user.findUnique({
        where: {
          email: validate.data.email,
        },
      });
    });

    if (!userExists) {
      return {
        success: false,
        message: "Invalid email or password",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: "Invalid email or password",
              path: ["email"],
            },
            {
              code: z.ZodIssueCode.custom,
              message: "Invalid email or password",
              path: ["password"],
            },
          ])
        ),
      };
    }

    if (!userExists.verifiedAt) {
      return {
        success: false,
        message: "User with this email is not verified.",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: "Email is not verified",
              path: ["email"],
            },
          ])
        ),
      };
    }

    if (!userExists.approvedAt) {
      return {
        success: false,
        message: "User with this email is not approved yet.",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: "Account is not approved yet",
              path: ["email"],
            },
          ])
        ),
      };
    }

    if (userExists.suspendedAt) {
      return {
        success: false,
        message: "User with this email is suspended.",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: "Account is suspended",
              path: ["email"],
            },
          ])
        ),
      };
    }

    const passwordMatch = await argon2.verify(
      userExists.password,
      validate.data.password
    );

    if (!passwordMatch) {
      return {
        success: false,
        message: "Invalid email or password",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: "Invalid email or password",
              path: ["email"],
            },
            {
              code: z.ZodIssueCode.custom,
              message: "Invalid email or password",
              path: ["password"],
            },
          ])
        ),
      };
    }

    const session = await createSession(userExists.id, deviceInfo);

    if (!session.success) {
      return {
        success: false,
        message: "Login failed due to session creation error",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: "Login failed",
              path: ["email"],
            },
            {
              code: z.ZodIssueCode.custom,
              message: "Login failed",
              path: ["password"],
            },
          ])
        ),
      };
    }

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.USER_LOGGED_IN,
        entity: AUDIT_LOG_ENTITY.USER,
        entityId: userExists.id,
        description: `User ${userExists.email} logged in.`,
        metadata: { deviceInfo: JSON.stringify(deviceInfo) },
        user: {
          connect: { id: userExists.id },
        },
      });
    } catch (error) {
      console.error("Failed to log audit event for login:", error);
    }

    return {
      success: true,
      message: "Login successful",
      data: null,
      errors: null,
    };
  } catch (error) {
    console.error("Login failed:", error);
    return {
      success: false,
      message: "Login failed due to an unexpected error",
      data: null,
      errors: error,
    };
  }
}

/**
 * Initiate forgot password process
 * @param data Forgot password data
 * @returns Result of the forgot password attempt
 */
export async function forgotPassword(data: ForgotPasswordData): Promise<{
  success: boolean;
  message: string;
  data: null;
  errors: ReturnType<typeof z.treeifyError> | unknown | null;
}> {
  try {
    const validate = await forgotPasswordSchema.safeParseAsync(data);

    if (!validate.success) {
      return {
        success: false,
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(validate.error),
      };
    }

    const deviceInfo = await getDeviceInfo();

    const userExists = await prisma.$transaction(async (tx) => {
      return await tx.user.findUnique({
        where: {
          email: validate.data.email,
        },
      });
    });

    if (!userExists) {
      return {
        success: false,
        message: "User with this email not found.",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: "Email not found",
              path: ["email"],
            },
          ])
        ),
      };
    }

    try {
      await sendPasswordResetEmail(userExists.email);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
    }

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.USER_FORGOT_PASSWORD,
        entity: AUDIT_LOG_ENTITY.USER,
        entityId: userExists.id,
        description: `User ${userExists.email} requested password reset.`,
        metadata: { deviceInfo: JSON.stringify(deviceInfo) },
        user: {
          connect: { id: userExists.id },
        },
      });
    } catch (error) {
      console.error("Failed to log audit event for forgot password:", error);
    }

    return {
      success: true,
      message: "Password reset email sent successfully",
      data: null,
      errors: null,
    };
  } catch (error) {
    console.error("Forgot password failed:", error);
    return {
      success: false,
      message: "Forgot password failed due to an unexpected error",
      data: null,
      errors: error,
    };
  }
}

/**
 * Reset user password
 * @param data Reset password data
 * @returns Result of the reset password attempt
 */
export async function resetPassword(data: ResetPasswordData): Promise<{
  success: boolean;
  message: string;
  data: null;
  errors: ReturnType<typeof z.treeifyError> | unknown | null;
}> {
  try {
    const validate = await resetPasswordSchema.safeParseAsync(data);

    if (!validate.success) {
      return {
        success: false,
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(validate.error),
      };
    }

    const deviceInfo = await getDeviceInfo();

    const tokenData = await redis.get(
      `password_reset_token:${validate.data.token}`
    );

    if (!tokenData) {
      return {
        success: false,
        message: "Invalid or expired password reset token",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: "Invalid or expired token",
              path: ["token"],
            },
          ])
        ),
      };
    }

    const userExists = await prisma.$transaction(async (tx) => {
      return await tx.user.findUnique({
        where: {
          email: tokenData,
        },
      });
    });

    if (!userExists) {
      return {
        success: false,
        message: "Unable to find user associated with this token.",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: "User not found",
              path: ["email"],
            },
          ])
        ),
      };
    }

    const compareOldPassword = await argon2.verify(
      userExists.password,
      validate.data.password
    );

    if (compareOldPassword) {
      return {
        success: false,
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: "New password must be different from the old password",
              path: ["newPassword"],
            },
          ])
        ),
      };
    }

    const hashedPassword = await argon2.hash(validate.data.password);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: userExists.id,
        },
        data: {
          password: hashedPassword,
        },
      });
    });

    await redis.del(`password_reset_token:${validate.data.token}`);

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.USER_RESET_PASSWORD,
        entity: AUDIT_LOG_ENTITY.USER,
        entityId: userExists.id,
        description: `User ${userExists.email} reset their password.`,
        metadata: { deviceInfo: JSON.stringify(deviceInfo) },
        user: {
          connect: { id: userExists.id },
        },
      });
    } catch (error) {
      console.error("Failed to log audit event for reset password:", error);
    }

    return {
      success: true,
      message: "Password reset successful",
      data: null,
      errors: null,
    };
  } catch (error) {
    console.error("Reset password failed:", error);
    return {
      success: false,
      message: "Reset password failed due to an unexpected error",
      data: null,
      errors: error,
    };
  }
}

/**
 * Logout user by revoking their session
 * @param sessionToken Session token
 * @returns Result of the logout attempt
 */
export async function logout(): Promise<{
  success: boolean;
  message: string;
  data: null;
  errors: unknown | null;
}> {
  try {
    const deviceInfo = await getDeviceInfo();

    const session = await revokeCurrentSession(deviceInfo);

    if (!session.success) {
      return {
        success: false,
        message: "Failed to revoke session",
        data: null,
        errors: null,
      };
    }

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.USER_LOGGED_OUT,
        entity: AUDIT_LOG_ENTITY.SESSION,
        entityId: session.data?.id ?? "",
        description: `Session revoked for user ID ${session.data?.userId ?? ""} on logout.`,
        metadata: { deviceInfo: JSON.stringify(deviceInfo) },
        user: {
          connect: { id: session.data?.userId ?? "" },
        },
      });
    } catch (error) {
      console.error("Failed to log audit event for logout:", error);
    }

    return {
      success: true,
      message: "Logout successful",
      data: null,
      errors: null,
    };
  } catch (error) {
    console.error("Logout failed:", error);
    return {
      success: false,
      message: "Logout failed due to an unexpected error",
      data: null,
      errors: error,
    };
  }
}
