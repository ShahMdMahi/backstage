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
      if (!(systemAccess.usersAccessLevel.length > 0)) {
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
      if (!(systemAccess.usersAccessLevel.length > 0)) {
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
      if (!(systemAccess.usersAccessLevel.length > 0)) {
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

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        approvedAt: new Date(),
      },
    });

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
      if (!(systemAccess.usersAccessLevel.length > 0)) {
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
        message: "User must be verified before approval.",
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

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        suspendedAt: new Date(),
      },
    });

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
