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
import { ROLE, USER_SYSTEM_ACCESS_LEVEL } from "@/lib/prisma/enums";
import { getCurrentSession } from "@/actions/shared/session";

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
        message: "User does not have permission to view all users.",
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
      if (!(systemAccess.usersAccessLevel.length > 0)) {
        return {
          success: false,
          message: "User does not have permission to view all users.",
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
        avatar: true,
        role: true,
        createdAt: true,
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
        message: "User does not have permission to view all users.",
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
      if (!(systemAccess.usersAccessLevel.length > 0)) {
        return {
          success: false,
          message: "User does not have permission to view all users.",
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
