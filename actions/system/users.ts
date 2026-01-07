"use server";

import { prisma } from "@/lib/prisma";
import {
  AuditLog,
  RightsManagement,
  Session,
  SharedWorkspaceAccountAccess,
  SystemAccess,
  User,
  WorkspaceAccount,
} from "@/lib/prisma/client";
import {
  ROLE,
  USER_SYSTEM_ACCESS_LEVEL,
  AUDIT_LOG_ACTION,
  AUDIT_LOG_ENTITY,
} from "@/lib/prisma/enums";
import { logAuditEvent } from "@/actions/shared/audit-log";
import { getCurrentSession } from "@/actions/shared/session";
import {
  sendApprovedUserEmail,
  sendUserSuspendedEmail,
  sendUserUnsuspendedEmail,
  sendNewUserCreatedEmail,
  sendUserUpdatedEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
} from "@/actions/shared/email";
import { getDeviceInfo } from "@/lib/device-info";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserData,
  type UpdateUserData,
} from "@/validators/system/user";
import * as argon2 from "argon2";
import z from "zod";

export async function getAllUsers(): Promise<{
  success: boolean;
  message: string;
  data: Partial<User>[] | null;
  errors: unknown | null;
}> {
  try {
    const session = await getCurrentSession();
    if (!session.success) {
      return {
        success: false,
        message: session.message,
        data: null,
        errors: session.errors,
      };
    }
    if (!session.data?.userId) {
      return {
        success: false,
        message: "User is not authenticated.",
        data: null,
        errors: new Error("Unauthenticated user"),
      };
    }
    if (
      session.data.user.role !== ROLE.SYSTEM_OWNER &&
      session.data.user.role !== ROLE.SYSTEM_ADMIN &&
      session.data.user.role !== ROLE.SYSTEM_USER
    ) {
      return {
        success: false,
        message: "User does not have permission to access users.",
        data: null,
        errors: new Error("Insufficient permissions"),
      };
    }

    if (session.data.user.role === ROLE.SYSTEM_USER) {
      if (!session.data.user.systemAccess) {
        return {
          success: false,
          message: "System access not found for the user.",
          data: null,
          errors: new Error("System access not found"),
        };
      }
      if (session.data.user.systemAccess.expiresAt < new Date()) {
        return {
          success: false,
          message: "User's system access has expired.",
          data: null,
          errors: new Error("System access expired"),
        };
      }
      if (session.data.user.systemAccess.suspendedAt) {
        return {
          success: false,
          message: "User's system access is suspended.",
          data: null,
          errors: new Error("System access suspended"),
        };
      }
      if (session.data.user.systemAccess.usersAccessLevel.length === 0) {
        return {
          success: false,
          message: "User does not have permission to access users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
      if (
        !session.data.user.systemAccess.usersAccessLevel.includes(
          USER_SYSTEM_ACCESS_LEVEL.VIEW
        )
      ) {
        return {
          success: false,
          message: "User does not have permission to view all users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
    }

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        verifiedAt: true,
        approvedAt: true,
        suspendedAt: true,
      },
    });

    if (users.length === 0) {
      return {
        success: false,
        message: "No users found.",
        data: null,
        errors: new Error("No users found"),
      };
    }

    return {
      success: true,
      message: "Users retrieved successfully.",
      data: users,
      errors: null,
    };
  } catch (error) {
    console.error("Error retrieving users:", error);
    return {
      success: false,
      message: "Failed to retrieve users.",
      data: null,
      errors: error,
    };
  }
}

export async function getUserById(userId: string): Promise<{
  success: boolean;
  message: string;
  data:
    | (User & {
        sessions: Session[];
        systemAccess: SystemAccess | null;
        assignedSystemAccesses: SystemAccess[];
        ownWorkspaceAccount: WorkspaceAccount | null;
        sharedWorkspaceAccountAccess: SharedWorkspaceAccountAccess | null;
        assignedWorkspaceAccountAccesses: SharedWorkspaceAccountAccess[];
        rightsManagements: RightsManagement[];
        auditLogs: AuditLog[];
      })
    | null;
  errors: unknown | null;
}> {
  try {
    const session = await getCurrentSession();
    if (!session.success) {
      return {
        success: false,
        message: session.message,
        data: null,
        errors: session.errors,
      };
    }
    if (!session.data?.userId) {
      return {
        success: false,
        message: "User is not authenticated.",
        data: null,
        errors: new Error("Unauthenticated user"),
      };
    }
    if (
      session.data.user.role !== ROLE.SYSTEM_OWNER &&
      session.data.user.role !== ROLE.SYSTEM_ADMIN &&
      session.data.user.role !== ROLE.SYSTEM_USER
    ) {
      return {
        success: false,
        message: "User does not have permission to access users.",
        data: null,
        errors: new Error("Insufficient permissions"),
      };
    }

    if (session.data.user.role === ROLE.SYSTEM_USER) {
      if (!session.data.user.systemAccess) {
        return {
          success: false,
          message: "System access not found for the user.",
          data: null,
          errors: new Error("System access not found"),
        };
      }
      if (session.data.user.systemAccess.expiresAt < new Date()) {
        return {
          success: false,
          message: "User's system access has expired.",
          data: null,
          errors: new Error("System access expired"),
        };
      }
      if (session.data.user.systemAccess.suspendedAt) {
        return {
          success: false,
          message: "User's system access is suspended.",
          data: null,
          errors: new Error("System access suspended"),
        };
      }
      if (session.data.user.systemAccess.usersAccessLevel.length === 0) {
        return {
          success: false,
          message: "User does not have permission to access users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
      if (
        !session.data.user.systemAccess.usersAccessLevel.includes(
          USER_SYSTEM_ACCESS_LEVEL.VIEW
        )
      ) {
        return {
          success: false,
          message: "User does not have permission to view all users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        sessions: {
          orderBy: { accessedAt: "desc" },
        },
        systemAccess: true,
        assignedSystemAccesses: {
          orderBy: { createdAt: "desc" },
        },
        ownWorkspaceAccount: true,
        sharedWorkspaceAccountAccess: true,
        assignedWorkspaceAccountAccesses: {
          orderBy: { createdAt: "desc" },
        },
        rightsManagements: {
          orderBy: { createdAt: "desc" },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found.",
        data: null,
        errors: new Error("User not found"),
      };
    }

    return {
      success: true,
      message: "User retrieved successfully.",
      data: user,
      errors: null,
    };
  } catch (error) {
    console.error("Error retrieving user by ID:", error);
    return {
      success: false,
      message: "Failed to retrieve user.",
      data: null,
      errors: error,
    };
  }
}

export async function approveUserById(userId: string): Promise<{
  success: boolean;
  message: string;
  data: User | null;
  errors: unknown | null;
}> {
  try {
    const session = await getCurrentSession();
    if (!session.success) {
      return {
        success: false,
        message: session.message,
        data: null,
        errors: session.errors,
      };
    }
    if (!session.data?.userId) {
      return {
        success: false,
        message: "User is not authenticated.",
        data: null,
        errors: new Error("Unauthenticated user"),
      };
    }
    if (
      session.data.user.role !== ROLE.SYSTEM_OWNER &&
      session.data.user.role !== ROLE.SYSTEM_ADMIN &&
      session.data.user.role !== ROLE.SYSTEM_USER
    ) {
      return {
        success: false,
        message: "User does not have permission to access users.",
        data: null,
        errors: new Error("Insufficient permissions"),
      };
    }

    if (session.data.user.role === ROLE.SYSTEM_USER) {
      if (!session.data.user.systemAccess) {
        return {
          success: false,
          message: "System access not found for the user.",
          data: null,
          errors: new Error("System access not found"),
        };
      }
      if (session.data.user.systemAccess.expiresAt < new Date()) {
        return {
          success: false,
          message: "User's system access has expired.",
          data: null,
          errors: new Error("System access expired"),
        };
      }
      if (session.data.user.systemAccess.suspendedAt) {
        return {
          success: false,
          message: "User's system access is suspended.",
          data: null,
          errors: new Error("System access suspended"),
        };
      }
      if (session.data.user.systemAccess.usersAccessLevel.length === 0) {
        return {
          success: false,
          message: "User does not have permission to access users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
      if (
        !session.data.user.systemAccess.usersAccessLevel.includes(
          USER_SYSTEM_ACCESS_LEVEL.APPROVE
        )
      ) {
        return {
          success: false,
          message: "User does not have permission to approve users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
    }

    const userExists = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userExists) {
      return {
        success: false,
        message: "User not found.",
        data: null,
        errors: new Error("User not found"),
      };
    }

    if (!userExists.verifiedAt) {
      return {
        success: false,
        message: "User must be verified before approval.",
        data: null,
        errors: new Error("User not verified"),
      };
    }

    if (userExists.approvedAt) {
      return {
        success: false,
        message: "User is already approved.",
        data: null,
        errors: new Error("User already approved"),
      };
    }

    const deviceInfo = await getDeviceInfo();

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        approvedAt: new Date(),
      },
    });

    try {
      await sendApprovedUserEmail(updatedUser.email, updatedUser.name);
    } catch (error) {
      console.error("Failed to send approved user email:", error);
    }

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.USER_APPROVED,
        entity: AUDIT_LOG_ENTITY.USER,
        entityId: updatedUser.id,
        description: `User ${updatedUser.email} approved by ${session.data?.user?.email}.`,
        metadata: { deviceInfo: JSON.stringify(deviceInfo) },
        user: { connect: { id: session.data.userId } },
      });
    } catch (error) {
      console.error("Failed to log audit event for user approval:", error);
    }

    return {
      success: true,
      message: "User approved successfully.",
      data: updatedUser,
      errors: null,
    };
  } catch (error) {
    console.error("Error approving user by ID:", error);
    return {
      success: false,
      message: "Failed to approve user.",
      data: null,
      errors: error,
    };
  }
}

export async function suspendUserById(userId: string): Promise<{
  success: boolean;
  message: string;
  data: User | null;
  errors: unknown | null;
}> {
  try {
    const session = await getCurrentSession();
    if (!session.success) {
      return {
        success: false,
        message: session.message,
        data: null,
        errors: session.errors,
      };
    }
    if (!session.data?.userId) {
      return {
        success: false,
        message: "User is not authenticated.",
        data: null,
        errors: new Error("Unauthenticated user"),
      };
    }
    if (
      session.data.user.role !== ROLE.SYSTEM_OWNER &&
      session.data.user.role !== ROLE.SYSTEM_ADMIN &&
      session.data.user.role !== ROLE.SYSTEM_USER
    ) {
      return {
        success: false,
        message: "User does not have permission to access users.",
        data: null,
        errors: new Error("Insufficient permissions"),
      };
    }

    if (session.data.user.role === ROLE.SYSTEM_USER) {
      if (!session.data.user.systemAccess) {
        return {
          success: false,
          message: "System access not found for the user.",
          data: null,
          errors: new Error("System access not found"),
        };
      }
      if (session.data.user.systemAccess.expiresAt < new Date()) {
        return {
          success: false,
          message: "User's system access has expired.",
          data: null,
          errors: new Error("System access expired"),
        };
      }
      if (session.data.user.systemAccess.suspendedAt) {
        return {
          success: false,
          message: "User's system access is suspended.",
          data: null,
          errors: new Error("System access suspended"),
        };
      }
      if (session.data.user.systemAccess.usersAccessLevel.length === 0) {
        return {
          success: false,
          message: "User does not have permission to access users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
      if (
        !session.data.user.systemAccess.usersAccessLevel.includes(
          USER_SYSTEM_ACCESS_LEVEL.SUSPEND
        )
      ) {
        return {
          success: false,
          message: "User does not have permission to suspend users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
    }

    const userExists = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userExists) {
      return {
        success: false,
        message: "User not found.",
        data: null,
        errors: new Error("User not found"),
      };
    }

    if (!userExists.verifiedAt) {
      return {
        success: false,
        message: "User must be verified before suspension.",
        data: null,
        errors: new Error("User not verified"),
      };
    }

    if (!userExists.approvedAt) {
      return {
        success: false,
        message: "User must be approved before suspension.",
        data: null,
        errors: new Error("User not approved"),
      };
    }

    if (userExists.suspendedAt) {
      return {
        success: false,
        message: "User is already suspended.",
        data: null,
        errors: new Error("User already suspended"),
      };
    }

    if (userExists.id === session.data.userId) {
      return {
        success: false,
        message: "Cannot suspend your own account.",
        data: null,
        errors: new Error("Cannot suspend own account"),
      };
    }

    if (
      userExists.role === ROLE.SYSTEM_OWNER &&
      session.data.user.role !== ROLE.SYSTEM_OWNER
    ) {
      return {
        success: false,
        message: "You cannot suspend a System Owner.",
        data: null,
        errors: new Error("Cannot suspend System Owner"),
      };
    }

    if (
      userExists.role === ROLE.SYSTEM_ADMIN &&
      session.data.user.role !== ROLE.SYSTEM_OWNER
    ) {
      return {
        success: false,
        message: "You cannot suspend a System Admin.",
        data: null,
        errors: new Error("Cannot suspend System Admin"),
      };
    }

    if (
      userExists.role === ROLE.SYSTEM_USER &&
      session.data.user.role === ROLE.SYSTEM_USER
    ) {
      return {
        success: false,
        message: "You cannot suspend another System User.",
        data: null,
        errors: new Error("Cannot suspend another System User"),
      };
    }

    const deviceInfo = await getDeviceInfo();

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        suspendedAt: new Date(),
      },
    });

    try {
      await sendUserSuspendedEmail(updatedUser.email, updatedUser.name);
    } catch (error) {
      console.error("Failed to send user suspended email:", error);
    }

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.USER_SUSPENDED,
        entity: AUDIT_LOG_ENTITY.USER,
        entityId: updatedUser.id,
        description: `User ${updatedUser.email} suspended by ${session.data?.user?.email}.`,
        metadata: { deviceInfo: JSON.stringify(deviceInfo) },
        user: { connect: { id: session.data.userId } },
      });
    } catch (error) {
      console.error("Failed to log audit event for user suspension:", error);
    }

    return {
      success: true,
      message: "User suspended successfully.",
      data: updatedUser,
      errors: null,
    };
  } catch (error) {
    console.error("Error suspending user by ID:", error);
    return {
      success: false,
      message: "Failed to suspend user.",
      data: null,
      errors: error,
    };
  }
}

export async function unsuspendUserById(userId: string): Promise<{
  success: boolean;
  message: string;
  data: User | null;
  errors: unknown | null;
}> {
  try {
    const session = await getCurrentSession();
    if (!session.success) {
      return {
        success: false,
        message: session.message,
        data: null,
        errors: session.errors,
      };
    }
    if (!session.data?.userId) {
      return {
        success: false,
        message: "User is not authenticated.",
        data: null,
        errors: new Error("Unauthenticated user"),
      };
    }
    if (
      session.data.user.role !== ROLE.SYSTEM_OWNER &&
      session.data.user.role !== ROLE.SYSTEM_ADMIN &&
      session.data.user.role !== ROLE.SYSTEM_USER
    ) {
      return {
        success: false,
        message: "User does not have permission to access users.",
        data: null,
        errors: new Error("Insufficient permissions"),
      };
    }

    if (session.data.user.role === ROLE.SYSTEM_USER) {
      if (!session.data.user.systemAccess) {
        return {
          success: false,
          message: "System access not found for the user.",
          data: null,
          errors: new Error("System access not found"),
        };
      }
      if (session.data.user.systemAccess.expiresAt < new Date()) {
        return {
          success: false,
          message: "User's system access has expired.",
          data: null,
          errors: new Error("System access expired"),
        };
      }
      if (session.data.user.systemAccess.suspendedAt) {
        return {
          success: false,
          message: "User's system access is suspended.",
          data: null,
          errors: new Error("System access suspended"),
        };
      }
      if (session.data.user.systemAccess.usersAccessLevel.length === 0) {
        return {
          success: false,
          message: "User does not have permission to access users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
      if (
        !session.data.user.systemAccess.usersAccessLevel.includes(
          USER_SYSTEM_ACCESS_LEVEL.SUSPEND
        )
      ) {
        return {
          success: false,
          message: "User does not have permission to unsuspend users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
    }

    const userExists = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userExists) {
      return {
        success: false,
        message: "User not found.",
        data: null,
        errors: new Error("User not found"),
      };
    }

    if (!userExists.verifiedAt) {
      return {
        success: false,
        message: "User must be verified before unsuspension.",
        data: null,
        errors: new Error("User not verified"),
      };
    }

    if (!userExists.approvedAt) {
      return {
        success: false,
        message: "User must be approved before unsuspension.",
        data: null,
        errors: new Error("User not approved"),
      };
    }

    if (!userExists.suspendedAt) {
      return {
        success: false,
        message: "User is not suspended.",
        data: null,
        errors: new Error("User not suspended"),
      };
    }

    if (userExists.id === session.data.userId) {
      return {
        success: false,
        message: "Cannot unsuspend your own account.",
        data: null,
        errors: new Error("Cannot unsuspend own account"),
      };
    }

    if (
      userExists.role === ROLE.SYSTEM_OWNER &&
      session.data.user.role !== ROLE.SYSTEM_OWNER
    ) {
      return {
        success: false,
        message: "You cannot unsuspend a System Owner.",
        data: null,
        errors: new Error("Cannot unsuspend System Owner"),
      };
    }

    if (
      userExists.role === ROLE.SYSTEM_ADMIN &&
      session.data.user.role !== ROLE.SYSTEM_OWNER
    ) {
      return {
        success: false,
        message: "You cannot unsuspend a System Admin.",
        data: null,
        errors: new Error("Cannot unsuspend System Admin"),
      };
    }

    if (
      userExists.role === ROLE.SYSTEM_USER &&
      session.data.user.role === ROLE.SYSTEM_USER
    ) {
      return {
        success: false,
        message: "You cannot unsuspend another System User.",
        data: null,
        errors: new Error("Cannot unsuspend another System User"),
      };
    }

    const deviceInfo = await getDeviceInfo();

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        suspendedAt: null,
      },
    });

    try {
      await sendUserUnsuspendedEmail(updatedUser.email, updatedUser.name);
    } catch (error) {
      console.error("Failed to send user unsuspended email:", error);
    }

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.USER_UNSUSPENDED,
        entity: AUDIT_LOG_ENTITY.USER,
        entityId: updatedUser.id,
        description: `User ${updatedUser.email} unsuspended by ${session.data?.user?.email}.`,
        metadata: { deviceInfo: JSON.stringify(deviceInfo) },
        user: { connect: { id: session.data.userId } },
      });
    } catch (error) {
      console.error("Failed to log audit event for user unsuspension:", error);
    }

    return {
      success: true,
      message: "User unsuspended successfully.",
      data: updatedUser,
      errors: null,
    };
  } catch (error) {
    console.error("Error unsuspending user by ID:", error);
    return {
      success: false,
      message: "Failed to unsuspend user.",
      data: null,
      errors: error,
    };
  }
}

export async function getAllSystemUsers(): Promise<{
  success: boolean;
  message: string;
  data: Partial<User>[] | null;
  errors: unknown | null;
}> {
  try {
    const session = await getCurrentSession();
    if (!session.success) {
      return {
        success: false,
        message: session.message,
        data: null,
        errors: session.errors,
      };
    }
    if (!session.data?.userId) {
      return {
        success: false,
        message: "User is not authenticated.",
        data: null,
        errors: new Error("Unauthenticated user"),
      };
    }
    if (
      session.data.user.role !== ROLE.SYSTEM_OWNER &&
      session.data.user.role !== ROLE.SYSTEM_ADMIN
    ) {
      return {
        success: false,
        message: "User does not have permission to access system users.",
        data: null,
        errors: new Error("Insufficient permissions"),
      };
    }

    const users = await prisma.user.findMany({
      where: {
        role: ROLE.SYSTEM_USER,
        verifiedAt: { not: null },
        approvedAt: { not: null },
        suspendedAt: null,
        systemAccess: null,
        sharedWorkspaceAccountAccess: null,
        ownWorkspaceAccount: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        verifiedAt: true,
        approvedAt: true,
        suspendedAt: true,
        systemAccess: true,
        sharedWorkspaceAccountAccess: true,
        ownWorkspaceAccount: true,
      },
    });

    if (users.length === 0) {
      return {
        success: false,
        message: "No system users found.",
        data: null,
        errors: new Error("No system users found"),
      };
    }

    return {
      success: true,
      message: "System users retrieved successfully.",
      data: users,
      errors: null,
    };
  } catch (error) {
    console.error("Error retrieving system users:", error);
    return {
      success: false,
      message: "Failed to retrieve system users.",
      data: null,
      errors: error,
    };
  }
}

export async function createUser(data: CreateUserData): Promise<{
  success: boolean;
  message: string;
  data: User | null;
  errors: unknown | null;
}> {
  try {
    const session = await getCurrentSession();
    if (!session.success) {
      return {
        success: false,
        message: session.message,
        data: null,
        errors: session.errors,
      };
    }
    if (!session.data?.userId) {
      return {
        success: false,
        message: "User is not authenticated.",
        data: null,
        errors: new Error("Unauthenticated user"),
      };
    }
    if (
      session.data.user.role !== ROLE.SYSTEM_OWNER &&
      session.data.user.role !== ROLE.SYSTEM_ADMIN &&
      session.data.user.role !== ROLE.SYSTEM_USER
    ) {
      return {
        success: false,
        message: "User does not have permission to create users.",
        data: null,
        errors: new Error("Insufficient permissions"),
      };
    }

    if (session.data.user.role === ROLE.SYSTEM_USER) {
      if (!session.data.user.systemAccess) {
        return {
          success: false,
          message: "System access not found for the user.",
          data: null,
          errors: new Error("System access not found"),
        };
      }
      if (session.data.user.systemAccess.expiresAt < new Date()) {
        return {
          success: false,
          message: "User's system access has expired.",
          data: null,
          errors: new Error("System access expired"),
        };
      }
      if (session.data.user.systemAccess.suspendedAt) {
        return {
          success: false,
          message: "User's system access is suspended.",
          data: null,
          errors: new Error("System access suspended"),
        };
      }
      if (session.data.user.systemAccess.usersAccessLevel.length === 0) {
        return {
          success: false,
          message: "User does not have permission to access users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
      if (
        !session.data.user.systemAccess.usersAccessLevel.includes(
          USER_SYSTEM_ACCESS_LEVEL.CREATE
        )
      ) {
        return {
          success: false,
          message: "User does not have permission to create users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
    }

    const validate = await createUserSchema.safeParseAsync(data);
    if (!validate.success) {
      return {
        success: false,
        message: "Validation failed.",
        data: null,
        errors: z.treeifyError(validate.error),
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validate.data.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "A user with this email already exists.",
        data: null,
        errors: new Error("Email already exists"),
      };
    }

    let userRole: ROLE = ROLE.USER;
    if (validate.data.role) {
      if (session.data.user.role === ROLE.SYSTEM_OWNER) {
        userRole = validate.data.role;
      } else if (session.data.user.role === ROLE.SYSTEM_ADMIN) {
        if (validate.data.role === ROLE.SYSTEM_OWNER) {
          return {
            success: false,
            message: "System admin cannot create system owner.",
            data: null,
            errors: new Error("Insufficient permissions"),
          };
        }
        userRole = validate.data.role;
      } else {
        userRole = ROLE.USER;
      }
    }

    const hashedPassword = await argon2.hash(validate.data.password);

    const deviceInfo = await getDeviceInfo();

    const newUser = await prisma.user.create({
      data: {
        name: validate.data.name,
        email: validate.data.email,
        phone: validate.data.phone,
        password: hashedPassword,
        avatar: validate.data.avatar || null,
        role: userRole,
      },
    });

    try {
      await sendNewUserCreatedEmail(
        newUser.email,
        newUser.name,
        validate.data.password,
        session.data.user.name
      );
    } catch (error) {
      console.error("Failed to send new user created email:", error);
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
        action: AUDIT_LOG_ACTION.USER_CREATED,
        entity: AUDIT_LOG_ENTITY.USER,
        entityId: newUser.id,
        description: `User ${newUser.email} created by ${session.data.user.email}.`,
        metadata: { deviceInfo: JSON.stringify(deviceInfo) },
        user: { connect: { id: session.data.userId } },
      });
    } catch (error) {
      console.error("Failed to log audit event for user creation:", error);
    }

    return {
      success: true,
      message: "User created successfully.",
      data: newUser,
      errors: null,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      message: "Failed to create user.",
      data: null,
      errors: error,
    };
  }
}

export async function updateUser(data: UpdateUserData): Promise<{
  success: boolean;
  message: string;
  data: User | null;
  errors: unknown | null;
}> {
  try {
    const session = await getCurrentSession();
    if (!session.success) {
      return {
        success: false,
        message: session.message,
        data: null,
        errors: session.errors,
      };
    }
    if (!session.data?.userId) {
      return {
        success: false,
        message: "User is not authenticated.",
        data: null,
        errors: new Error("Unauthenticated user"),
      };
    }
    if (
      session.data.user.role !== ROLE.SYSTEM_OWNER &&
      session.data.user.role !== ROLE.SYSTEM_ADMIN &&
      session.data.user.role !== ROLE.SYSTEM_USER
    ) {
      return {
        success: false,
        message: "User does not have permission to update users.",
        data: null,
        errors: new Error("Insufficient permissions"),
      };
    }

    const validate = await updateUserSchema.safeParseAsync(data);
    if (!validate.success) {
      return {
        success: false,
        message: "Validation failed.",
        data: null,
        errors: validate.error.flatten().fieldErrors,
      };
    }

    const userToUpdate = await prisma.user.findUnique({
      where: { id: validate.data.id },
      include: {
        systemAccess: true,
        assignedSystemAccesses: true,
        ownWorkspaceAccount: true,
        sharedWorkspaceAccountAccess: true,
        assignedWorkspaceAccountAccesses: true,
      },
    });

    if (!userToUpdate) {
      return {
        success: false,
        message: "User not found.",
        data: null,
        errors: new Error("User not found"),
      };
    }

    if (userToUpdate.id === session.data.userId) {
      return {
        success: false,
        message: "Cannot edit your own account from here.",
        data: null,
        errors: new Error("Cannot edit self"),
      };
    }

    if (session.data.user.role === ROLE.SYSTEM_ADMIN) {
      if (
        userToUpdate.role === ROLE.SYSTEM_OWNER ||
        userToUpdate.role === ROLE.SYSTEM_ADMIN
      ) {
        return {
          success: false,
          message: "System admin cannot edit system owner or other admins.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
    }

    if (session.data.user.role === ROLE.SYSTEM_USER) {
      if (!session.data.user.systemAccess) {
        return {
          success: false,
          message: "System access not found.",
          data: null,
          errors: new Error("System access not found"),
        };
      }
      if (session.data.user.systemAccess.expiresAt < new Date()) {
        return {
          success: false,
          message: "System access is expired.",
          data: null,
          errors: new Error("System access expired"),
        };
      }
      if (session.data.user.systemAccess.suspendedAt) {
        return {
          success: false,
          message: "System access is suspended.",
          data: null,
          errors: new Error("System access suspended"),
        };
      }
      if (session.data.user.systemAccess.usersAccessLevel.length === 0) {
        return {
          success: false,
          message: "User does not have permission to access users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
      if (
        !session.data.user.systemAccess.usersAccessLevel.includes(
          USER_SYSTEM_ACCESS_LEVEL.UPDATE
        )
      ) {
        return {
          success: false,
          message: "User does not have permission to update users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
      if (userToUpdate.role !== ROLE.USER) {
        return {
          success: false,
          message: "System user can only update regular users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
    }

    let newRole = userToUpdate.role;
    if (validate.data.role && validate.data.role !== userToUpdate.role) {
      if (
        userToUpdate.systemAccess ||
        userToUpdate.assignedSystemAccesses.length > 0 ||
        userToUpdate.ownWorkspaceAccount ||
        userToUpdate.sharedWorkspaceAccountAccess ||
        userToUpdate.assignedWorkspaceAccountAccesses.length > 0
      ) {
        return {
          success: false,
          message:
            "Cannot change role for user with system access or workspace associations.",
          data: null,
          errors: new Error("Role change not allowed"),
        };
      }

      if (session.data.user.role === ROLE.SYSTEM_OWNER) {
        newRole = validate.data.role as ROLE;
      } else if (session.data.user.role === ROLE.SYSTEM_ADMIN) {
        if (
          validate.data.role === ROLE.SYSTEM_OWNER ||
          validate.data.role === ROLE.SYSTEM_ADMIN
        ) {
          return {
            success: false,
            message: "System admin cannot assign system owner or admin role.",
            data: null,
            errors: new Error("Insufficient permissions"),
          };
        }
        newRole = validate.data.role as ROLE;
      } else {
        return {
          success: false,
          message: "You do not have permission to change user roles.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
    }

    const updateData: {
      name?: string;
      phone?: string;
      avatar?: string | null;
      role?: ROLE;
    } = {};

    if (validate.data.name) updateData.name = validate.data.name;
    if (validate.data.phone) {
      updateData.phone = validate.data.phone;
    }
    if (validate.data.avatar === "") {
      updateData.avatar = null;
    } else if (validate.data.avatar) {
      updateData.avatar = validate.data.avatar;
    }
    if (newRole !== userToUpdate.role) updateData.role = newRole;

    const deviceInfo = await getDeviceInfo();

    const updatedUser = await prisma.user.update({
      where: { id: validate.data.id },
      data: updateData,
    });

    try {
      await sendUserUpdatedEmail(
        updatedUser.email,
        updatedUser.name,
        session.data.user.name
      );
    } catch (error) {
      console.error("Failed to send user updated email:", error);
    }

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.USER_UPDATED,
        entity: AUDIT_LOG_ENTITY.USER,
        entityId: updatedUser.id,
        description: `User ${updatedUser.email} updated by ${session.data.user.email}.`,
        metadata: { deviceInfo: JSON.stringify(deviceInfo) },
        user: { connect: { id: session.data.userId } },
      });
    } catch (error) {
      console.error("Failed to log audit event for user update:", error);
    }

    return {
      success: true,
      message: "User updated successfully.",
      data: updatedUser,
      errors: null,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      message: "Failed to update user.",
      data: null,
      errors: error,
    };
  }
}

export async function deleteUser(userId: string): Promise<{
  success: boolean;
  message: string;
  data: User | null;
  errors: unknown | null;
}> {
  try {
    const session = await getCurrentSession();
    if (!session.success) {
      return {
        success: false,
        message: session.message,
        data: null,
        errors: session.errors,
      };
    }
    if (!session.data?.userId) {
      return {
        success: false,
        message: "User is not authenticated.",
        data: null,
        errors: new Error("Unauthenticated user"),
      };
    }
    if (
      session.data.user.role !== ROLE.SYSTEM_OWNER &&
      session.data.user.role !== ROLE.SYSTEM_ADMIN &&
      session.data.user.role !== ROLE.SYSTEM_USER
    ) {
      return {
        success: false,
        message: "User does not have permission to delete users.",
        data: null,
        errors: new Error("Insufficient permissions"),
      };
    }

    if (session.data.user.role === ROLE.SYSTEM_USER) {
      if (!session.data.user.systemAccess) {
        return {
          success: false,
          message: "System access not found.",
          data: null,
          errors: new Error("System access not found"),
        };
      }
      if (session.data.user.systemAccess.expiresAt < new Date()) {
        return {
          success: false,
          message: "System access is expired.",
          data: null,
          errors: new Error("System access expired"),
        };
      }
      if (session.data.user.systemAccess.suspendedAt) {
        return {
          success: false,
          message: "System access is suspended.",
          data: null,
          errors: new Error("System access suspended"),
        };
      }
      if (session.data.user.systemAccess.usersAccessLevel.length === 0) {
        return {
          success: false,
          message: "User does not have permission to access users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
      if (
        !session.data.user.systemAccess.usersAccessLevel.includes(
          USER_SYSTEM_ACCESS_LEVEL.DELETE
        )
      ) {
        return {
          success: false,
          message: "User does not have permission to delete users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
    }

    // Get the user to delete
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        systemAccess: true,
        ownWorkspaceAccount: true,
        sharedWorkspaceAccountAccess: true,
      },
    });

    if (!userToDelete) {
      return {
        success: false,
        message: "User not found.",
        data: null,
        errors: new Error("User not found"),
      };
    }

    // Cannot delete yourself
    if (userToDelete.id === session.data.userId) {
      return {
        success: false,
        message: "Cannot delete your own account.",
        data: null,
        errors: new Error("Cannot delete self"),
      };
    }

    // Only regular USER role can be deleted
    if (userToDelete.role !== ROLE.USER) {
      return {
        success: false,
        message: "Only regular users can be deleted.",
        data: null,
        errors: new Error("Cannot delete non-user role"),
      };
    }

    // Cannot delete if has system access
    if (userToDelete.systemAccess) {
      return {
        success: false,
        message: "Cannot delete user with system access. Remove access first.",
        data: null,
        errors: new Error("Has system access"),
      };
    }

    // Cannot delete if has workspace associations
    if (
      userToDelete.ownWorkspaceAccount ||
      userToDelete.sharedWorkspaceAccountAccess
    ) {
      return {
        success: false,
        message:
          "Cannot delete user with workspace associations. Remove them first.",
        data: null,
        errors: new Error("Has workspace associations"),
      };
    }

    const deviceInfo = await getDeviceInfo();

    await prisma.session.deleteMany({
      where: { userId: userId },
    });

    await prisma.auditLog.deleteMany({
      where: { userId: userId },
    });

    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.USER_DELETED,
        entity: AUDIT_LOG_ENTITY.USER,
        entityId: deletedUser.id,
        description: `User ${deletedUser.email} deleted by ${session.data.user.email}.`,
        metadata: { deviceInfo: JSON.stringify(deviceInfo) },
        user: { connect: { id: session.data.userId } },
      });
    } catch (error) {
      console.error("Failed to log audit event for user deletion:", error);
    }

    return {
      success: true,
      message: "User deleted successfully.",
      data: deletedUser,
      errors: null,
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: "Failed to delete user.",
      data: null,
      errors: error,
    };
  }
}
