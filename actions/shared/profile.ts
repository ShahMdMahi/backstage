"use server";

import {
  updateMeSchema,
  updateMyPasswordSchema,
  UpdateMeData,
  UpdateMyPasswordData,
} from "@/validators/user";
import { prisma } from "@/lib/prisma";
import * as argon2 from "argon2";
import z from "zod";
import { logAuditEvent } from "./audit-log";
import { AUDIT_LOG_ACTION, AUDIT_LOG_ENTITY } from "@/lib/prisma/enums";
import { User } from "@/lib/prisma/client";
import { getDeviceInfo } from "@/lib/device-info";
import { getCurrentSession } from "@/actions/shared/session";

export async function updateMe(data: UpdateMeData): Promise<{
  success: boolean;
  message: string;
  data: User | null;
  errors: ReturnType<typeof z.treeifyError> | unknown | null;
}> {
  try {
    const session = await getCurrentSession();

    if (!session.success) {
      return {
        success: false,
        message: "Unauthorized",
        data: null,
        errors: new Error("Unauthorized"),
      };
    }

    const validate = await updateMeSchema.safeParseAsync(data);

    if (!validate.success) {
      return {
        success: false,
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(validate.error),
      };
    }

    const userExists = await prisma.user.findUnique({
      where: { id: session.data!.user.id },
    });

    if (!userExists) {
      return {
        success: false,
        message: "User not found",
        data: null,
        errors: new Error("User not found"),
      };
    }

    const deviceInfo = await getDeviceInfo();

    const updatedUser = await prisma.user.update({
      where: { id: session.data!.user.id },
      data: {
        name: validate.data.name,
        phone: validate.data.phone,
        avatar: validate.data.avatar,
      },
    });

    if (!updatedUser) {
      return {
        success: false,
        message: "User failed to update",
        data: null,
        errors: new Error("User failed to update"),
      };
    }

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.USER_UPDATED,
        entity: AUDIT_LOG_ENTITY.USER,
        entityId: updatedUser.id,
        description: `User ${updatedUser.email} updated by ${session.data?.user?.email}.`,
        metadata: {
          deviceInfo: JSON.stringify(deviceInfo),
          updatedFrom: JSON.stringify(userExists),
          updatedTo: JSON.stringify(updatedUser),
          updateBy: JSON.stringify(session.data),
        },
        user: {
          connect: { id: updatedUser.id },
        },
      });
    } catch (error) {
      console.error("Failed to log audit event for registration:", error);
    }

    return {
      success: true,
      message: "User updated successfully",
      data: updatedUser,
      errors: null,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
      data: null,
      errors: error,
    };
  }
}

export async function updateMyPassword(data: UpdateMyPasswordData): Promise<{
  success: boolean;
  message: string;
  data: User | null;
  errors: ReturnType<typeof z.treeifyError> | unknown | null;
}> {
  try {
    const session = await getCurrentSession();

    if (!session.success) {
      return {
        success: false,
        message: "Unauthorized",
        data: null,
        errors: new Error("Unauthorized"),
      };
    }

    const validate = await updateMyPasswordSchema.safeParseAsync(data);

    if (!validate.success) {
      return {
        success: false,
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(validate.error),
      };
    }

    if (validate.data.currentPassword === validate.data.newPassword) {
      return {
        success: false,
        message: "New password must be different from current password",
        data: null,
        errors: new Error(
          "New password must be different from current password"
        ),
      };
    }

    const userExists = await prisma.user.findUnique({
      where: { id: session.data!.user.id },
    });

    if (!userExists) {
      return {
        success: false,
        message: "User not found",
        data: null,
        errors: new Error("User not found"),
      };
    }

    const passwordMatch = await argon2.verify(
      userExists.password,
      validate.data.currentPassword
    );

    if (!passwordMatch) {
      return {
        success: false,
        message: "Current password is incorrect",
        data: null,
        errors: new Error("Current password is incorrect"),
      };
    }

    const hashedNewPassword = await argon2.hash(validate.data.newPassword);

    const deviceInfo = await getDeviceInfo();

    const updatedUser = await prisma.user.update({
      where: { id: session.data!.user.id },
      data: { password: hashedNewPassword },
    });

    if (!updatedUser) {
      return {
        success: false,
        message: "User failed to update",
        data: null,
        errors: new Error("User failed to update"),
      };
    }

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.USER_PASSWORD_CHANGED,
        entity: AUDIT_LOG_ENTITY.USER,
        entityId: updatedUser.id,
        description: `User ${updatedUser.email} password updated by ${session.data?.user?.email}.`,
        metadata: {
          deviceInfo: JSON.stringify(deviceInfo),
          updateBy: JSON.stringify(session.data),
        },
        user: {
          connect: { id: updatedUser.id },
        },
      });
    } catch (error) {
      console.error("Failed to log audit event for registration:", error);
    }

    return {
      success: true,
      message: "Password updated successfully",
      data: updatedUser,
      errors: null,
    };
  } catch (error) {
    console.error("Error updating user password:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
      data: null,
      errors: error,
    };
  }
}
