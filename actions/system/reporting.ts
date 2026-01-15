"use server";

import { prisma } from "@/lib/prisma";
import { Reporting, User } from "@/lib/prisma/client";
import {
  ROLE,
  REPORTING_SYSTEM_ACCESS_LEVEL,
  AUDIT_LOG_ACTION,
  AUDIT_LOG_ENTITY,
} from "@/lib/prisma/enums";
import { logAuditEvent } from "@/actions/shared/audit-log";
import { getCurrentSession } from "@/actions/shared/session";
import {
  CreateReportingData,
  createReportingSchema,
} from "@/validators/system/reporting";
import z from "zod";
import { getDeviceInfo } from "@/lib/device-info";

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
      orderBy: { reportingMonth: "desc" },
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

export async function checkReportingHashExists(hash: string): Promise<{
  success: boolean;
  message: string;
  data: { hashExists: boolean | null };
  errors: unknown;
}> {
  try {
    const session = await getCurrentSession();
    if (!session.success) {
      return {
        success: false,
        message: session.message,
        data: { hashExists: null },
        errors: session.errors,
      };
    }
    if (!session.data?.userId) {
      return {
        success: false,
        message: "User is not authenticated.",
        data: { hashExists: null },
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
        data: { hashExists: null },
        errors: new Error("Insufficient permissions"),
      };
    }

    if (session.data.user.role === ROLE.SYSTEM_USER) {
      if (!session.data.user.systemAccess) {
        return {
          success: false,
          message: "System access not found for the user.",
          data: { hashExists: null },
          errors: new Error("System access not found"),
        };
      }
      if (session.data.user.systemAccess.expiresAt < new Date()) {
        return {
          success: false,
          message: "User's system access has expired.",
          data: { hashExists: null },
          errors: new Error("System access expired"),
        };
      }
      if (session.data.user.systemAccess.suspendedAt) {
        return {
          success: false,
          message: "User's system access is suspended.",
          data: { hashExists: null },
          errors: new Error("System access suspended"),
        };
      }
      if (session.data.user.systemAccess.reportingAccessLevel.length === 0) {
        return {
          success: false,
          message: "User does not have permission to access reportings.",
          data: { hashExists: null },
          errors: new Error("Insufficient permissions"),
        };
      }
      if (
        !session.data.user.systemAccess.reportingAccessLevel.includes(
          REPORTING_SYSTEM_ACCESS_LEVEL.CREATE
        )
      ) {
        return {
          success: false,
          message: "User does not have permission to create reporting.",
          data: { hashExists: null },
          errors: new Error("Insufficient permissions"),
        };
      }
    }

    const reporting = await prisma.reporting.findUnique({
      where: { hash },
      select: {
        id: true,
        hash: true,
      },
    });

    if (reporting) {
      return {
        success: true,
        message: "This reporting is already uploaded.",
        data: { hashExists: true },
        errors: new Error("Reporting hash exists"),
      };
    }

    return {
      success: true,
      message: "Reporting hash does not exist.",
      data: { hashExists: false },
      errors: null,
    };
  } catch (error) {
    console.error("Error checking reporting hash:", error);
    return {
      success: false,
      message: "Failed to fetch reporting hash",
      data: { hashExists: null },
      errors: error,
    };
  }
}

export async function checkReportingNameExists(name: string): Promise<{
  success: boolean;
  message: string;
  data: { nameExists: boolean | null };
  errors: unknown;
}> {
  try {
    const session = await getCurrentSession();
    if (!session.success) {
      return {
        success: false,
        message: session.message,
        data: { nameExists: null },
        errors: session.errors,
      };
    }
    if (!session.data?.userId) {
      return {
        success: false,
        message: "User is not authenticated.",
        data: { nameExists: null },
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
        data: { nameExists: null },
        errors: new Error("Insufficient permissions"),
      };
    }

    if (session.data.user.role === ROLE.SYSTEM_USER) {
      if (!session.data.user.systemAccess) {
        return {
          success: false,
          message: "System access not found for the user.",
          data: { nameExists: null },
          errors: new Error("System access not found"),
        };
      }
      if (session.data.user.systemAccess.expiresAt < new Date()) {
        return {
          success: false,
          message: "User's system access has expired.",
          data: { nameExists: null },
          errors: new Error("System access expired"),
        };
      }
      if (session.data.user.systemAccess.suspendedAt) {
        return {
          success: false,
          message: "User's system access is suspended.",
          data: { nameExists: null },
          errors: new Error("System access suspended"),
        };
      }
      if (session.data.user.systemAccess.reportingAccessLevel.length === 0) {
        return {
          success: false,
          message: "User does not have permission to access reportings.",
          data: { nameExists: null },
          errors: new Error("Insufficient permissions"),
        };
      }
      if (
        !session.data.user.systemAccess.reportingAccessLevel.includes(
          REPORTING_SYSTEM_ACCESS_LEVEL.CREATE
        )
      ) {
        return {
          success: false,
          message: "User does not have permission to create reporting.",
          data: { nameExists: null },
          errors: new Error("Insufficient permissions"),
        };
      }
    }

    const reporting = await prisma.reporting.findUnique({
      where: { name },
      select: {
        id: true,
        name: true,
      },
    });

    if (reporting) {
      return {
        success: true,
        message: "This reporting is already uploaded.",
        data: { nameExists: true },
        errors: new Error("Reporting name exists"),
      };
    }

    return {
      success: true,
      message: "Reporting name does not exist.",
      data: { nameExists: false },
      errors: null,
    };
  } catch (error) {
    console.error("Error checking reporting name:", error);
    return {
      success: false,
      message: "Failed to fetch reporting name",
      data: { nameExists: null },
      errors: error,
    };
  }
}

export async function createReporting(data: CreateReportingData): Promise<{
  success: boolean;
  message: string;
  data: Partial<Reporting> | null;
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
          REPORTING_SYSTEM_ACCESS_LEVEL.CREATE
        )
      ) {
        return {
          success: false,
          message: "User does not have permission to create reporting.",
          data: null,
          errors: new Error("Insufficient permissions"),
        };
      }
    }

    const validate = await createReportingSchema.safeParseAsync(data);
    if (!validate.success) {
      return {
        success: false,
        message: "Validation failed.",
        data: null,
        errors: z.treeifyError(validate.error),
      };
    }

    const content = await data.file.text();

    const checkHashExists = await prisma.reporting.findUnique({
      where: { hash: data.hash },
      select: { id: true, hash: true },
    });

    if (checkHashExists) {
      return {
        success: false,
        message: "This reporting is already uploaded.",
        data: null,
        errors: new Error("Reporting hash exists"),
      };
    }

    const deviceInfo = await getDeviceInfo();

    const newReporting = await prisma.reporting.create({
      data: {
        name: data.name,
        raw: content,
        hash: data.hash,
        type: data.type,
        currency: data.currency,
        delimiter: data.delimiter,
        netRevenue: data.netRevenue,
        reportingMonth: data.reportingMonth,
        uploader: { connect: { id: session.data.userId } },
      },
      select: {
        id: true,
      },
    });

    if (!newReporting) {
      return {
        success: false,
        message: "Failed to create reporting.",
        data: null,
        errors: new Error("Reporting creation failed"),
      };
    }

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.REPORTING_UPLOADED,
        entity: AUDIT_LOG_ENTITY.REPORTING,
        entityId: newReporting.id,
        description: `Reporting "${data.name}" uploaded by user "${session.data.user.email}".`,
        metadata: { deviceInfo: JSON.stringify(deviceInfo) },
        user: { connect: { id: session.data.userId } },
      });
    } catch (error) {
      console.error("Error logging audit event for reporting upload:", error);
    }

    return {
      success: true,
      message: "Reporting created successfully.",
      data: newReporting,
      errors: null,
    };
  } catch (error) {
    console.error("Error checking reporting hash:", error);
    return {
      success: false,
      message: "Failed to fetch reporting hash",
      data: null,
      errors: error,
    };
  }
}
