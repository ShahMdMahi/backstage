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
} from "@/actions/shared/email";
import { getDeviceInfo } from "@/lib/device-info";

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
      const systemAccess = await prisma.systemAccess.findUnique({
        where: {
          userId: session.data.userId,
        },
      });
      if (!systemAccess) {
        return {
          success: false,
          message: "System access not found for the user.",
          data: null,
          errors: new Error("System access not found"),
        };
      }
      if (systemAccess.expiresAt < new Date()) {
        return {
          success: false,
          message: "User's system access has expired.",
          data: null,
          errors: new Error("System access expired"),
        };
      }
      if (systemAccess.suspendedAt) {
        return {
          success: false,
          message: "User's system access is suspended.",
          data: null,
          errors: new Error("System access suspended"),
        };
      }
      if (systemAccess.usersAccessLevel.length === 0) {
        return {
          success: false,
          message: "User does not have permission to access users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
      if (
        !systemAccess.usersAccessLevel.includes(USER_SYSTEM_ACCESS_LEVEL.VIEW)
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
      const systemAccess = await prisma.systemAccess.findUnique({
        where: {
          userId: session.data.userId,
        },
      });
      if (!systemAccess) {
        return {
          success: false,
          message: "System access not found for the user.",
          data: null,
          errors: new Error("System access not found"),
        };
      }
      if (systemAccess.expiresAt < new Date()) {
        return {
          success: false,
          message: "User's system access has expired.",
          data: null,
          errors: new Error("System access expired"),
        };
      }
      if (systemAccess.suspendedAt) {
        return {
          success: false,
          message: "User's system access is suspended.",
          data: null,
          errors: new Error("System access suspended"),
        };
      }
      if (systemAccess.usersAccessLevel.length === 0) {
        return {
          success: false,
          message: "User does not have permission to access users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
      if (
        !systemAccess.usersAccessLevel.includes(USER_SYSTEM_ACCESS_LEVEL.VIEW)
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
        sessions: true,
        systemAccess: true,
        assignedSystemAccesses: true,
        ownWorkspaceAccount: true,
        sharedWorkspaceAccountAccess: true,
        assignedWorkspaceAccountAccesses: true,
        rightsManagements: true,
        auditLogs: true,
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
      const systemAccess = await prisma.systemAccess.findUnique({
        where: {
          userId: session.data.userId,
        },
      });
      if (!systemAccess) {
        return {
          success: false,
          message: "System access not found for the user.",
          data: null,
          errors: new Error("System access not found"),
        };
      }
      if (systemAccess.expiresAt < new Date()) {
        return {
          success: false,
          message: "User's system access has expired.",
          data: null,
          errors: new Error("System access expired"),
        };
      }
      if (systemAccess.suspendedAt) {
        return {
          success: false,
          message: "User's system access is suspended.",
          data: null,
          errors: new Error("System access suspended"),
        };
      }
      if (systemAccess.usersAccessLevel.length === 0) {
        return {
          success: false,
          message: "User does not have permission to access users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
      if (
        !systemAccess.usersAccessLevel.includes(
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
      const systemAccess = await prisma.systemAccess.findUnique({
        where: {
          userId: session.data.userId,
        },
      });
      if (!systemAccess) {
        return {
          success: false,
          message: "System access not found for the user.",
          data: null,
          errors: new Error("System access not found"),
        };
      }
      if (systemAccess.expiresAt < new Date()) {
        return {
          success: false,
          message: "User's system access has expired.",
          data: null,
          errors: new Error("System access expired"),
        };
      }
      if (systemAccess.suspendedAt) {
        return {
          success: false,
          message: "User's system access is suspended.",
          data: null,
          errors: new Error("System access suspended"),
        };
      }
      if (systemAccess.usersAccessLevel.length === 0) {
        return {
          success: false,
          message: "User does not have permission to access users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
      if (
        !systemAccess.usersAccessLevel.includes(
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
      const systemAccess = await prisma.systemAccess.findUnique({
        where: {
          userId: session.data.userId,
        },
      });
      if (!systemAccess) {
        return {
          success: false,
          message: "System access not found for the user.",
          data: null,
          errors: new Error("System access not found"),
        };
      }
      if (systemAccess.expiresAt < new Date()) {
        return {
          success: false,
          message: "User's system access has expired.",
          data: null,
          errors: new Error("System access expired"),
        };
      }
      if (systemAccess.suspendedAt) {
        return {
          success: false,
          message: "User's system access is suspended.",
          data: null,
          errors: new Error("System access suspended"),
        };
      }
      if (systemAccess.usersAccessLevel.length === 0) {
        return {
          success: false,
          message: "User does not have permission to access users.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
      if (
        !systemAccess.usersAccessLevel.includes(
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
