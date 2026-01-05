"use server";

import { prisma } from "@/lib/prisma";
import { SystemAccess, User } from "@/lib/prisma/client";
import { ROLE } from "@/lib/prisma/enums";
import { getCurrentSession } from "@/actions/shared/session";

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
            role: true,
          },
        },
        assigner: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
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
