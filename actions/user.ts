"use server";

import {
  updateUserSchema,
  updateUserPasswordSchema,
  UpdateUserData,
  UpdateUserPasswordData,
} from "@/validators/user";
import { prisma } from "@/lib/prisma";
import * as argon2 from "argon2";
import z from "zod";
import { logAuditEvent } from "./audit-log";
import { AUDIT_LOG_ACTION, AUDIT_LOG_ENTITY, ROLE } from "@/lib/prisma/enums";
import { User } from "@/lib/prisma/client";
import { getDeviceInfo } from "@/lib/device-info";
import { getCurrentSession } from "./session";

export async function updateUserById(
  userId: string,
  data: UpdateUserData
): Promise<{
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

    const validate = await updateUserSchema.safeParseAsync(data);

    if (!validate.success) {
      return {
        success: false,
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(validate.error),
      };
    }

    const isSelfUpdate = session.data?.user.id === userId;
    const userRole = session.data?.user.role;
    const isAdmin =
      userRole === ROLE.DEVELOPER || userRole === ROLE.SYSTEM_ADMIN;

    // Check if trying to update role
    const isRoleUpdate = validate.data.role !== undefined;

    // No one can change their own role
    if (isSelfUpdate && isRoleUpdate) {
      return {
        success: false,
        message: "Users cannot change their own role",
        data: null,
        errors: new Error("Users cannot change their own role"),
      };
    }

    // For self-updates
    if (isSelfUpdate) {
      // USER can only update name, avatar, phone
      if (userRole === ROLE.USER) {
        const allowedFields = ["name", "avatar", "phone"];
        const updatingFields = Object.keys(validate.data);
        const hasUnauthorizedField = updatingFields.some(
          (field) => !allowedFields.includes(field)
        );
        if (hasUnauthorizedField) {
          return {
            success: false,
            message: "Unauthorized to update these fields",
            data: null,
            errors: new Error("Unauthorized to update these fields"),
          };
        }
      }
      // Admins can update their own name, avatar, phone (role already blocked)
    } else {
      // Non-self updates require admin
      if (!isAdmin) {
        return {
          success: false,
          message: "Unauthorized",
          data: null,
          errors: new Error("Unauthorized"),
        };
      }
      // Role hierarchy will be checked after userExists
    }

    const deviceInfo = await getDeviceInfo();

    const userExists = await prisma.user.findUnique({ where: { id: userId } });

    if (!userExists) {
      return {
        success: false,
        message: "User not found",
        data: null,
        errors: new Error("User not found"),
      };
    }

    // Only DEVELOPER can update DEVELOPER data
    if (
      !isSelfUpdate &&
      userExists.role === ROLE.DEVELOPER &&
      userRole !== ROLE.DEVELOPER
    ) {
      return {
        success: false,
        message: "Unauthorized to update developer data",
        data: null,
        errors: new Error("Unauthorized to update developer data"),
      };
    }

    const isEmailUpdate =
      validate.data.email && validate.data.email !== userExists.email;

    // If email is updated, reset verifiedAt
    if (isEmailUpdate) {
      validate.data.verifiedAt = null;
    }

    // Role update hierarchy for non-self updates
    if (!isSelfUpdate && isRoleUpdate) {
      const targetRole = validate.data.role;
      if (userRole === ROLE.DEVELOPER) {
        // Can promote/demote to any role
      } else if (userRole === ROLE.SYSTEM_ADMIN) {
        // Can only promote USER to SYSTEM_ADMIN or demote SYSTEM_ADMIN to USER
        const allowed =
          (targetRole === ROLE.SYSTEM_ADMIN && userExists.role === ROLE.USER) ||
          (targetRole === ROLE.USER && userExists.role === ROLE.SYSTEM_ADMIN);
        if (!allowed) {
          return {
            success: false,
            message: "Unauthorized to update role to this level",
            data: null,
            errors: new Error("Unauthorized to update role to this level"),
          };
        }
      }
    }

    // For self-updates, only allow updating name, phone, avatar
    if (isSelfUpdate) {
      validate.data = {
        name: validate.data.name,
        phone: validate.data.phone,
        avatar: validate.data.avatar,
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validate.data,
    });

    if (!updatedUser) {
      return {
        success: false,
        message: "Failed to update user",
        data: null,
        errors: new Error("Failed to update user"),
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

export async function updateUserPasswordById(
  userId: string,
  data: UpdateUserPasswordData
): Promise<{
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

    const validate = await updateUserPasswordSchema.safeParseAsync(data);

    if (!validate.success) {
      return {
        success: false,
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(validate.error),
      };
    }

    const isSelfUpdate = session.data?.user.id === userId;
    const userRole = session.data?.user.role;

    // Non-self updates require admin
    if (!isSelfUpdate) {
      if (userRole !== ROLE.DEVELOPER && userRole !== ROLE.SYSTEM_ADMIN) {
        return {
          success: false,
          message: "Unauthorized",
          data: null,
          errors: new Error("Unauthorized"),
        };
      }
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return {
        success: false,
        message: "User not found",
        data: null,
        errors: null,
      };
    }

    // SYSTEM_ADMIN cannot change DEVELOPER password
    if (
      !isSelfUpdate &&
      userRole === ROLE.SYSTEM_ADMIN &&
      user.role === ROLE.DEVELOPER
    ) {
      return {
        success: false,
        message: "Unauthorized to change developer password",
        data: null,
        errors: new Error("Unauthorized to change developer password"),
      };
    }

    // Check current password for self-updates or USER role
    if (isSelfUpdate || userRole === ROLE.USER) {
      const isCurrentPasswordValid = await argon2.verify(
        user.password,
        validate.data.currentPassword
      );

      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: "Current password is incorrect",
          data: null,
          errors: null,
        };
      }
    }

    // Check if new password is the same as old
    const isNewPasswordSameAsOld = await argon2.verify(
      user.password,
      validate.data.newPassword
    );

    if (isNewPasswordSameAsOld) {
      return {
        success: false,
        message: "New password cannot be the same as the old password",
        data: null,
        errors: new Error(
          "New password cannot be the same as the old password"
        ),
      };
    }

    const hashedNewPassword = await argon2.hash(validate.data.newPassword);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

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
