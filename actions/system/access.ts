"use server";

import { prisma } from "@/lib/prisma";
import { SystemAccess } from "@/lib/prisma/client";
import { getCurrentSession } from "@/actions/shared/session";

export async function getCurrentSystemAccess(): Promise<{
  success: boolean;
  message: string;
  data: (SystemAccess & {}) | null;
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
    console.error("Error retrieving system access settings:", error);
    return {
      success: false,
      message: "Failed to retrieve system access settings.",
      data: null,
      errors: error,
    };
  }
}
