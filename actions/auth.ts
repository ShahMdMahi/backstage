"use server";

import {
  RegisterData,
  ResendVerificationData,
  LoginData,
  ForgotPasswordData,
  ResetPasswordData,
  registerSchema,
  resendVerificationSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/types/auth";
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
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: "custom",
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
      message: "Registration failed",
      data: null,
      errors: error,
    };
  }
}

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
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: "custom",
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
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: "custom",
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
      message: "Resend verification failed",
      data: null,
      errors: error,
    };
  }
}

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
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: "custom",
              message: "Invalid email or password",
              path: ["email", "password"],
            },
          ])
        ),
      };
    }

    if (!userExists.verifiedAt) {
      return {
        success: false,
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: "custom",
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
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: "custom",
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
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: "custom",
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
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: "custom",
              message: "Invalid email or password",
              path: ["email", "password"],
            },
          ])
        ),
      };
    }

    // TODO: Verify password and handle session

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
      message: "Login failed",
      data: null,
      errors: error,
    };
  }
}

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
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: "custom",
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
      message: "Forgot password failed",
      data: null,
      errors: error,
    };
  }
}

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
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: "custom",
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
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(
          new z.ZodError([
            {
              code: "custom",
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
              code: "custom",
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
        description: `User with token ${validate.data.token} reset their password.`,
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
      message: "Reset password failed",
      data: null,
      errors: error,
    };
  }
}
