"use server";

import { prisma } from "@/lib/prisma";
import { Reporting, User } from "@/lib/prisma/client";
import {
  ROLE,
  REPORTING_SYSTEM_ACCESS_LEVEL,
  //   AUDIT_LOG_ACTION,
  //   AUDIT_LOG_ENTITY,
} from "@/lib/prisma/enums";
// import { logAuditEvent } from "@/actions/shared/audit-log";
import { getCurrentSession } from "@/actions/shared/session";

export async function getAllReportings(): Promise<{
  success: boolean;
  message: string;
  data:
    | (Partial<Reporting> & {
        uploader: Partial<User> | null;
        processor: Partial<User> | null;
      })[]
    | null;
  errors: unknown;
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
        message: "User does not have permission to access reportings.",
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
      if (session.data.user.systemAccess.reportingAccessLevel.length === 0) {
        return {
          success: false,
          message: "User does not have permission to access reportings.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
      if (
        !session.data.user.systemAccess.reportingAccessLevel.includes(
          REPORTING_SYSTEM_ACCESS_LEVEL.VIEW
        )
      ) {
        return {
          success: false,
          message: "User does not have permission to view all reportings.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
    }

    const reportings = await prisma.reporting.findMany({
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            avatar: true,
          },
        },
        processor: {
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
      omit: { raw: true },
      orderBy: { createdAt: "desc" },
    });

    if (reportings.length === 0) {
      return {
        success: true,
        message: "No reportings found.",
        data: null,
        errors: new Error("No reportings found"),
      };
    }

    return {
      success: true,
      message: "Reportings fetched successfully.",
      data: reportings,
      errors: null,
    };
  } catch (error) {
    console.error("Error fetching reportings:", error);
    return {
      success: false,
      message: "Failed to fetch reportings",
      data: null,
      errors: error,
    };
  }
}

export async function getReportingById(reportingId: string): Promise<{
  success: boolean;
  message: string;
  data:
    | (Reporting & {
        uploader: Partial<User> | null;
        processor: Partial<User> | null;
      })
    | null;
  errors: unknown;
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
        message: "User does not have permission to access reportings.",
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
      if (session.data.user.systemAccess.reportingAccessLevel.length === 0) {
        return {
          success: false,
          message: "User does not have permission to access reportings.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
      if (
        !session.data.user.systemAccess.reportingAccessLevel.includes(
          REPORTING_SYSTEM_ACCESS_LEVEL.VIEW
        )
      ) {
        return {
          success: false,
          message: "User does not have permission to view reporting.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
    }

    const reporting = await prisma.reporting.findUnique({
      where: { id: reportingId },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            avatar: true,
          },
        },
        processor: {
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

    if (!reporting) {
      return {
        success: true,
        message: "Reporting not found.",
        data: null,
        errors: new Error("Reporting not found"),
      };
    }

    return {
      success: true,
      message: "Reporting fetched successfully.",
      data: reporting,
      errors: null,
    };
  } catch (error) {
    console.error("Error fetching reporting:", error);
    return {
      success: false,
      message: "Failed to fetch reporting",
      data: null,
      errors: error,
    };
  }
}
