"use server";

import { prisma } from "@/lib/prisma";
import { AuditLog } from "@/lib/prisma/client";
import { AuditLogCreateInput } from "@/lib/prisma/models";
import { sendFormattedAuditLog } from "@/actions/system/telegram";

/**
 * Logs an audit event to the database.
 * @param data The data for the audit log entry.
 * @returns An object indicating the success or failure of the operation, along with the created audit log or error information.
 */
export async function logAuditEvent(data: AuditLogCreateInput): Promise<void> {
  try {
    const auditLog = await prisma.$transaction(async (tx) => {
      return await tx.auditLog.create({
        data,
        include: {
          user: true,
        },
      });
    });

    if (!auditLog.id) {
      console.error("Failed to create audit log entry");
      return;
    }

    try {
      await sendFormattedAuditLog(auditLog);
    } catch (error) {
      console.error("Failed to send audit log to Telegram:", error);
    }
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}

/**
 * Retrieves all audit logs from the database.
 * @returns An object indicating the success or failure of the operation, along with the retrieved audit logs or error information.
 */
export async function getAllAuditLogs(): Promise<{
  success: boolean;
  message: string;
  data: AuditLog[] | [] | null;
  error: unknown | null;
}> {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
      },
    });

    if (auditLogs.length === 0) {
      return {
        success: true,
        message: "No audit logs found",
        data: [],
        error: null,
      };
    }

    return {
      success: true,
      message: "Audit logs retrieved successfully",
      data: auditLogs,
      error: null,
    };
  } catch (error) {
    console.error("Failed to retrieve audit logs:", error);
    return {
      success: false,
      message: "Failed to retrieve audit logs",
      data: null,
      error: error,
    };
  }
}
