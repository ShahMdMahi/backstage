"use server";

import { prisma } from "@/lib/prisma";
import { SystemAccess, User } from "@/lib/prisma/client";
import { ROLE } from "@/lib/prisma/enums";
import { getCurrentSession } from "@/actions/shared/session";
import {
  CreateAccessData,
  createAccessSchema,
  UpdateAccessData,
  updateAccessSchema,
} from "@/validators/system/access";
import z from "zod";

export async function getCurrentSystemAccess(): Promise<{
  success: boolean;
  message: string;
  data: SystemAccess | null;
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
    if (session.data.user.role !== ROLE.SYSTEM_USER) {
      return {
        success: false,
        message: "User does not have system access permissions.",
        data: null,
        errors: new Error("Insufficient permissions"),
      };
    }
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

    return {
      success: true,
      message: "System access retrieved successfully.",
      data: systemAccess,
      errors: null,
    };
  } catch (error) {
    console.error("Error retrieving system access:", error);
    return {
      success: false,
      message: "Failed to retrieve system access.",
      data: null,
      errors: error,
    };
  }
}

export async function getAllSystemAccesses(): Promise<{
  success: boolean;
  message: string;
  data:
    | (SystemAccess & { user: Partial<User>; assigner: Partial<User> })[]
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
      session.data.user.role !== ROLE.SYSTEM_ADMIN
    ) {
      return {
        success: false,
        message: "User does not have permission to view system accesses.",
        data: null,
        errors: new Error("Insufficient permissions"),
      };
    }
    const systemAccesses = await prisma.systemAccess.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            avatar: true,
          },
        },
        assigner: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    if (systemAccesses.length === 0) {
      return {
        success: false,
        message: "No system accesses found.",
        data: null,
        errors: new Error("No system accesses found"),
      };
    }

    return {
      success: true,
      message: "System accesses retrieved successfully.",
      data: systemAccesses,
      errors: null,
    };
  } catch (error) {
    console.error("Error retrieving system accesses:", error);
    return {
      success: false,
      message: "Failed to retrieve system accesses.",
      data: null,
      errors: error,
    };
  }
}

export async function getSystemAccessById(systemAccessId: string): Promise<{
  success: boolean;
  message: string;
  data: (SystemAccess & { user: User; assigner: User }) | null;
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
        message: "User does not have permission to view system accesses.",
        data: null,
        errors: new Error("Insufficient permissions"),
      };
    }
    const systemAccess = await prisma.systemAccess.findUnique({
      where: {
        id: systemAccessId,
      },
      include: {
        user: true,
        assigner: true,
      },
    });

    if (!systemAccess) {
      return {
        success: false,
        message: "System access not found.",
        data: null,
        errors: new Error("System access not found"),
      };
    }

    return {
      success: true,
      message: "System access retrieved successfully.",
      data: systemAccess,
      errors: null,
    };
  } catch (error) {
    console.error("Error retrieving system access by ID:", error);
    return {
      success: false,
      message: "Failed to retrieve system access.",
      data: null,
      errors: error,
    };
  }
}

export async function createSystemAccess(data: CreateAccessData): Promise<{
  success: boolean;
  message: string;
  data:
    | (SystemAccess & { user: Partial<User>; assigner: Partial<User> })
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
      session.data.user.role !== ROLE.SYSTEM_ADMIN
    ) {
      return {
        success: false,
        message: "User does not have permission to view system accesses.",
        data: null,
        errors: new Error("Insufficient permissions"),
      };
    }

    const validate = await createAccessSchema.safeParseAsync(data);

    if (!validate.success) {
      return {
        success: false,
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(validate.error),
      };
    }

    const userExists = await prisma.user.findUnique({
      where: { id: validate.data.userId },
      include: {
        systemAccess: true,
        ownWorkspaceAccount: true,
        sharedWorkspaceAccountAccess: true,
      },
    });

    if (!userExists) {
      return {
        success: false,
        message: "User not found",
        data: null,
        errors: new Error("User not found"),
      };
    }

    if (userExists.role !== ROLE.SYSTEM_USER) {
      return {
        success: false,
        message: "Cannot assign system access to non-system users.",
        data: null,
        errors: new Error("Invalid user role"),
      };
    }

    if (userExists.id === session.data.userId) {
      return {
        success: false,
        message: "Cannot assign system access to yourself.",
        data: null,
        errors: new Error("Self-assignment not allowed"),
      };
    }

    if (!userExists.verifiedAt) {
      return {
        success: false,
        message: "Cannot assign system access to unverified users.",
        data: null,
        errors: new Error("User not verified"),
      };
    }

    if (!userExists.approvedAt) {
      return {
        success: false,
        message: "Cannot assign system access to unapproved users.",
        data: null,
        errors: new Error("User not approved"),
      };
    }

    if (userExists.suspendedAt) {
      return {
        success: false,
        message: "Cannot assign system access to suspended users.",
        data: null,
        errors: new Error("User is suspended"),
      };
    }

    if (userExists.systemAccess) {
      return {
        success: false,
        message: "System access already exists for this user.",
        data: null,
        errors: new Error("Duplicate system access"),
      };
    }

    if (
      userExists.ownWorkspaceAccount ||
      userExists.sharedWorkspaceAccountAccess
    ) {
      return {
        success: false,
        message:
          "User has existing workspace account access. Cannot assign system access.",
        data: null,
        errors: new Error("Conflicting access roles"),
      };
    }

    const systemAccess = await prisma.systemAccess.create({
      data: {
        usersAccessLevel: validate.data.permissions?.userAccess,
        workspaceAccountsAccessLevel:
          validate.data.permissions?.workspaceAccess,
        reportingAccessLevel: validate.data.permissions?.reportingAccess,
        releasesAccessLevel: validate.data.permissions?.releaseAccess,
        tracksAccessLevel: validate.data.permissions?.trackAccess,
        videosAccessLevel: validate.data.permissions?.videoAccess,
        ringtonesAccessLevel: validate.data.permissions?.ringtoneAccess,
        artistsAccessLevel: validate.data.permissions?.artistAccess,
        performersAccessLevel: validate.data.permissions?.performerAccess,
        producersAndEngineersAccessLevel:
          validate.data.permissions?.producerEngineerAccess,
        writersAccessLevel: validate.data.permissions?.writerAccess,
        publishersAccessLevel: validate.data.permissions?.publisherAccess,
        labelsAccessLevel: validate.data.permissions?.labelAccess,
        transactionsAccessLevel: validate.data.permissions?.transactionAccess,
        withdrawsAccessLevel: validate.data.permissions?.withdrawAccess,
        consumptionAccessLevel: validate.data.permissions?.consumptionAccess,
        engagementAccessLevel: validate.data.permissions?.engagementAccess,
        revenueAccessLevel: validate.data.permissions?.revenueAccess,
        geoAccessLevel: validate.data.permissions?.geoAccess,
        rightsManagementAccessLevel:
          validate.data.permissions?.rightsManagementAccess,
        expiresAt: validate.data.expiresAt,
        user: { connect: { id: validate.data.userId } },
        assigner: { connect: { id: session.data.userId } },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            avatar: true,
          },
        },
        assigner: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    if (!systemAccess) {
      return {
        success: false,
        message: "Failed to create system access.",
        data: null,
        errors: new Error("System access creation failed"),
      };
    }

    return {
      success: true,
      message: "System access created successfully.",
      data: systemAccess,
      errors: null,
    };
  } catch (error) {
    console.error("Error retrieving system accesses:", error);
    return {
      success: false,
      message: "Failed to retrieve system accesses.",
      data: null,
      errors: error,
    };
  }
}

export async function updateSystemAccess(data: UpdateAccessData): Promise<{
  success: boolean;
  message: string;
  data:
    | (SystemAccess & { user: Partial<User>; assigner: Partial<User> })
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
      session.data.user.role !== ROLE.SYSTEM_ADMIN
    ) {
      return {
        success: false,
        message: "User does not have permission to update system accesses.",
        data: null,
        errors: new Error("Insufficient permissions"),
      };
    }

    const validate = await updateAccessSchema.safeParseAsync(data);

    if (!validate.success) {
      return {
        success: false,
        message: "Validation failed",
        data: null,
        errors: z.treeifyError(validate.error),
      };
    }

    const existingAccess = await prisma.systemAccess.findUnique({
      where: { id: validate.data.id },
      include: {
        user: true,
      },
    });

    if (!existingAccess) {
      return {
        success: false,
        message: "System access not found.",
        data: null,
        errors: new Error("System access not found"),
      };
    }

    if (existingAccess.userId === session.data.userId) {
      return {
        success: false,
        message: "Cannot update your own system access.",
        data: null,
        errors: new Error("Self-modification not allowed"),
      };
    }

    // Handle suspension logic
    let suspendedAt: Date | null = existingAccess.suspendedAt;
    if (validate.data.isSuspended === true && !existingAccess.suspendedAt) {
      // Suspend the access
      suspendedAt = new Date();
    } else if (
      validate.data.isSuspended === false &&
      existingAccess.suspendedAt
    ) {
      // Unsuspend the access
      suspendedAt = null;
    }

    const systemAccess = await prisma.systemAccess.update({
      where: { id: validate.data.id },
      data: {
        usersAccessLevel: validate.data.permissions?.userAccess,
        workspaceAccountsAccessLevel:
          validate.data.permissions?.workspaceAccess,
        reportingAccessLevel: validate.data.permissions?.reportingAccess,
        releasesAccessLevel: validate.data.permissions?.releaseAccess,
        tracksAccessLevel: validate.data.permissions?.trackAccess,
        videosAccessLevel: validate.data.permissions?.videoAccess,
        ringtonesAccessLevel: validate.data.permissions?.ringtoneAccess,
        artistsAccessLevel: validate.data.permissions?.artistAccess,
        performersAccessLevel: validate.data.permissions?.performerAccess,
        producersAndEngineersAccessLevel:
          validate.data.permissions?.producerEngineerAccess,
        writersAccessLevel: validate.data.permissions?.writerAccess,
        publishersAccessLevel: validate.data.permissions?.publisherAccess,
        labelsAccessLevel: validate.data.permissions?.labelAccess,
        transactionsAccessLevel: validate.data.permissions?.transactionAccess,
        withdrawsAccessLevel: validate.data.permissions?.withdrawAccess,
        consumptionAccessLevel: validate.data.permissions?.consumptionAccess,
        engagementAccessLevel: validate.data.permissions?.engagementAccess,
        revenueAccessLevel: validate.data.permissions?.revenueAccess,
        geoAccessLevel: validate.data.permissions?.geoAccess,
        rightsManagementAccessLevel:
          validate.data.permissions?.rightsManagementAccess,
        expiresAt: validate.data.expiresAt,
        suspendedAt: suspendedAt,
        assigner: { connect: { id: session.data.userId } },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            avatar: true,
          },
        },
        assigner: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    if (!systemAccess) {
      return {
        success: false,
        message: "Failed to update system access.",
        data: null,
        errors: new Error("System access update failed"),
      };
    }

    return {
      success: true,
      message: "System access updated successfully.",
      data: systemAccess,
      errors: null,
    };
  } catch (error) {
    console.error("Error updating system access:", error);
    return {
      success: false,
      message: "Failed to update system access.",
      data: null,
      errors: error,
    };
  }
}

export async function deleteSystemAccess(accessId: string): Promise<{
  success: boolean;
  message: string;
  data:
    | (SystemAccess & { user: Partial<User>; assigner: Partial<User> })
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
      session.data.user.role !== ROLE.SYSTEM_ADMIN
    ) {
      return {
        success: false,
        message: "User does not have permission to delete system accesses.",
        data: null,
        errors: new Error("Insufficient permissions"),
      };
    }

    const existingAccess = await prisma.systemAccess.findUnique({
      where: { id: accessId },
      include: {
        user: true,
      },
    });

    if (!existingAccess) {
      return {
        success: false,
        message: "System access not found.",
        data: null,
        errors: new Error("System access not found"),
      };
    }

    if (existingAccess.userId === session.data.userId) {
      return {
        success: false,
        message: "Cannot delete your own system access.",
        data: null,
        errors: new Error("Self-deletion not allowed"),
      };
    }

    const deletedAccess = await prisma.systemAccess.delete({
      where: { id: accessId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            avatar: true,
          },
        },
        assigner: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    if (!deletedAccess) {
      return {
        success: false,
        message: "Failed to delete system access.",
        data: null,
        errors: new Error("System access deletion failed"),
      };
    }

    return {
      success: true,
      message: "System access deleted successfully.",
      data: deletedAccess,
      errors: null,
    };
  } catch (error) {
    console.error("Error deleting system access:", error);
    return {
      success: false,
      message: "Failed to delete system access.",
      data: null,
      errors: error,
    };
  }
}
