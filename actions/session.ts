"use server";

import { DeviceInfo, getDeviceInfo } from "@/lib/device-info";
import { prisma } from "@/lib/prisma";
import {
  AUDIT_LOG_ACTION,
  AUDIT_LOG_ENTITY,
  Session,
  User,
} from "@/lib/prisma/client";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { logAuditEvent } from "./audit-log";

export async function createSession(
  userId: string,
  deviceInfo: DeviceInfo
): Promise<{
  success: boolean;
  message: string;
  data: (Session & { user: User }) | null;
  errors: unknown | null;
}> {
  try {
    const token = randomBytes(32).toString("hex");

    const session = await prisma.$transaction(async (tx) => {
      return await tx.session.create({
        data: {
          token,
          userAgent: deviceInfo.userAgent,
          ipAddress: deviceInfo.ipAddress,
          deviceFingerprint: deviceInfo.deviceFingerprint,
          deviceType: deviceInfo.deviceType,
          metadata: { deviceInfo: JSON.stringify(deviceInfo) },
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 days
          user: {
            connect: { id: userId },
          },
        },
        include: {
          user: true,
        },
      });
    });

    if (!session) {
      return {
        success: false,
        message: "Failed to create session",
        data: null,
        errors: new Error("Session creation failed"),
      };
    }

    const cookieManager = await cookies();

    cookieManager.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 1 day
    });

    const allSessions = await prisma.session.findMany({
      where: { userId },
    });

    if (allSessions.length > 5) {
      const sessionsToRevoke = allSessions
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .slice(0, allSessions.length - 5);

      for (const oldSession of sessionsToRevoke) {
        await prisma.session.update({
          where: { id: oldSession.id },
          data: { revokedAt: new Date() },
        });
      }
    }

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.SESSION_CREATED,
        entity: AUDIT_LOG_ENTITY.SESSION,
        entityId: session.id,
        description: `Session created for user ID ${userId}`,
        metadata: { deviceInfo: JSON.stringify(deviceInfo) },
        user: {
          connect: { id: userId },
        },
      });
    } catch (error) {
      console.error("Failed to log audit event for session creation:", error);
    }

    return {
      success: true,
      message: "Session created successfully",
      data: session,
      errors: null,
    };
  } catch (error) {
    console.error("Failed to create session:", error);
    return {
      success: false,
      message: "Failed to create session",
      data: null,
      errors: error,
    };
  }
}

export async function getCurrentSession(): Promise<{
  success: boolean;
  message: string;
  data: (Session & { user: User }) | null;
  errors: unknown | null;
}> {
  try {
    const cookieManager = await cookies();
    const sessionToken = cookieManager.get("session_token")?.value;
    const deviceInfo = await getDeviceInfo();

    if (!sessionToken) {
      return {
        success: false,
        message: "No session token found",
        data: null,
        errors: new Error("No session token in cookies"),
      };
    }

    const session = await prisma.session.findUnique({
      where: {
        token: sessionToken,
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      return {
        success: false,
        message: "Invalid session token",
        data: null,
        errors: new Error("Session not found"),
      };
    }

    if (session.expiresAt < new Date()) {
      return {
        success: false,
        message: "Session has expired",
        data: null,
        errors: new Error("Session expired"),
      };
    }

    if (session.revokedAt) {
      return {
        success: false,
        message: "Session has been revoked",
        data: null,
        errors: new Error("Session revoked"),
      };
    }

    if (session.userAgent !== deviceInfo.userAgent) {
      try {
        const updatedSession = await prisma.session.update({
          where: { id: session.id },
          data: {
            revokedAt: new Date(),
            metadata: {
              revokedReason: "User agent mismatch",
            },
          },
        });
        await logAuditEvent({
          action: AUDIT_LOG_ACTION.SESSION_REVOKED,
          entity: AUDIT_LOG_ENTITY.SESSION,
          entityId: updatedSession.id,
          description: `Session revoked due to user agent mismatch for user ID ${updatedSession.userId}`,
          metadata: {
            originalDeviceInfo: (
              updatedSession.metadata as {
                deviceInfo: string & Record<string, unknown>;
              }
            )?.deviceInfo,
            currentDeviceInfo: JSON.stringify(deviceInfo),
          },
          user: {
            connect: { id: session.userId },
          },
        });
      } catch (error) {
        console.error("Error revoking session:", error);
      }
      return {
        success: false,
        message: "Session revoked due to user agent mismatch",
        data: null,
        errors: new Error("User agent mismatch"),
      };
    }
    if (session.deviceFingerprint !== deviceInfo.deviceFingerprint) {
      try {
        const updatedSession = await prisma.session.update({
          where: { id: session.id },
          data: {
            revokedAt: new Date(),
            metadata: {
              revokedReason: "Device fingerprint mismatch",
            },
          },
        });
        await logAuditEvent({
          action: AUDIT_LOG_ACTION.SESSION_REVOKED,
          entity: AUDIT_LOG_ENTITY.SESSION,
          entityId: updatedSession.id,
          description: `Session revoked due to device fingerprint mismatch for user ID ${updatedSession.userId}`,
          metadata: {
            originalDeviceInfo: (
              updatedSession.metadata as {
                deviceInfo: string & Record<string, unknown>;
              }
            )?.deviceInfo,
            currentDeviceInfo: JSON.stringify(deviceInfo),
          },
          user: {
            connect: { id: updatedSession.userId },
          },
        });
      } catch (error) {
        console.error("Error revoking session:", error);
      }
      return {
        success: false,
        message: "Session revoked due to device fingerprint mismatch",
        data: null,
        errors: new Error("Device fingerprint mismatch"),
      };
    }
    if (!session.user.verifiedAt) {
      try {
        const updatedSession = await prisma.session.update({
          where: { id: session.id },
          data: {
            revokedAt: new Date(),
            metadata: {
              revokedReason: "User not verified",
            },
          },
        });
        await logAuditEvent({
          action: AUDIT_LOG_ACTION.SESSION_REVOKED,
          entity: AUDIT_LOG_ENTITY.SESSION,
          entityId: updatedSession.id,
          description: `Session revoked due to unverified user for user ID ${updatedSession.userId}`,
          metadata: {
            originalDeviceInfo: (
              updatedSession.metadata as {
                deviceInfo: string & Record<string, unknown>;
              }
            )?.deviceInfo,
            currentDeviceInfo: JSON.stringify(deviceInfo),
          },
          user: {
            connect: { id: updatedSession.userId },
          },
        });
      } catch (error) {
        console.error("Error logging audit event for unverified user:", error);
      }
      return {
        success: false,
        message: "Session revoked due to unverified user",
        data: null,
        errors: new Error("User not verified"),
      };
    }
    if (!session.user.approvedAt) {
      try {
        const updatedSession = await prisma.session.update({
          where: { id: session.id },
          data: {
            revokedAt: new Date(),
            metadata: {
              revokedReason: "User not approved",
            },
          },
        });
        await logAuditEvent({
          action: AUDIT_LOG_ACTION.SESSION_REVOKED,
          entity: AUDIT_LOG_ENTITY.SESSION,
          entityId: updatedSession.id,
          description: `Session revoked due to unapproved user for user ID ${updatedSession.userId}`,
          metadata: {
            originalDeviceInfo: (
              updatedSession.metadata as {
                deviceInfo: string & Record<string, unknown>;
              }
            )?.deviceInfo,
            currentDeviceInfo: JSON.stringify(deviceInfo),
          },
          user: {
            connect: { id: session.userId },
          },
        });
      } catch (error) {
        console.error("Error logging audit event for unapproved user:", error);
      }
      return {
        success: false,
        message: "Session revoked due to unapproved user",
        data: null,
        errors: new Error("User not approved"),
      };
    }
    if (session.user.suspendedAt) {
      try {
        const updatedSession = await prisma.session.update({
          where: { id: session.id },
          data: {
            revokedAt: new Date(),
            metadata: {
              revokedReason: "User suspended",
            },
          },
        });
        await logAuditEvent({
          action: AUDIT_LOG_ACTION.SESSION_REVOKED,
          entity: AUDIT_LOG_ENTITY.SESSION,
          entityId: updatedSession.id,
          description: `Session revoked due to suspended user for user ID ${updatedSession.userId}`,
          metadata: {
            originalDeviceInfo: (
              updatedSession.metadata as {
                deviceInfo: string & Record<string, unknown>;
              }
            )?.deviceInfo,
            currentDeviceInfo: JSON.stringify(deviceInfo),
          },
          user: {
            connect: { id: updatedSession.userId },
          },
        });
      } catch (error) {
        console.error("Error logging audit event for suspended user:", error);
      }
      return {
        success: false,
        message: "Session revoked due to suspended user",
        data: null,
        errors: new Error("User suspended"),
      };
    }

    return {
      success: true,
      message: "Session retrieved successfully",
      data: session,
      errors: null,
    };
  } catch (error) {
    console.error("Failed to retrieve session:", error);
    return {
      success: false,
      message: "Failed to retrieve session",
      data: null,
      errors: error,
    };
  }
}

export async function revokeCurrentSession(deviceInfo: DeviceInfo): Promise<{
  success: boolean;
  message: string;
  data: (Session & { user: User }) | null;
  errors: unknown | null;
}> {
  try {
    const cookieManager = await cookies();
    const sessionToken = cookieManager.get("session_token")?.value;

    if (!sessionToken) {
      return {
        success: false,
        message: "No session token found",
        data: null,
        errors: new Error("No session token in cookies"),
      };
    }

    const session = await prisma.$transaction(async (tx) => {
      return await tx.session.update({
        where: {
          token: sessionToken,
        },
        data: {
          revokedAt: new Date(),
        },
        include: {
          user: true,
        },
      });
    });

    if (!session) {
      return {
        success: false,
        message: "Session not found",
        data: null,
        errors: new Error("Session not found"),
      };
    }

    cookieManager.delete("session_token");

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.SESSION_REVOKED,
        entity: AUDIT_LOG_ENTITY.SESSION,
        entityId: session.id,
        description: `Current session revoked for user ID ${session.userId}`,
        metadata: {
          deviceInfo: JSON.stringify(deviceInfo),
        },
        user: {
          connect: { id: session.userId },
        },
      });
    } catch (error) {
      console.error(
        "Failed to log audit event for current session revocation:",
        error
      );
    }

    return {
      success: true,
      message: "Current session revoked successfully",
      data: session,
      errors: null,
    };
  } catch (error) {
    console.error("Failed to revoke current session:", error);
    return {
      success: false,
      message: "Failed to revoke current session",
      data: null,
      errors: error,
    };
  }
}

export async function getAllSessionsForUser(userId: string): Promise<{
  success: boolean;
  message: string;
  data: Session[] | null;
  errors: unknown | null;
}> {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (sessions.length === 0) {
      return {
        success: false,
        message: "No sessions found for user",
        data: null,
        errors: new Error("No sessions found"),
      };
    }

    return {
      success: true,
      message: "Sessions retrieved successfully",
      data: sessions,
      errors: null,
    };
  } catch (error) {
    console.error("Failed to retrieve sessions for user:", error);
    return {
      success: false,
      message: "Failed to retrieve sessions for user",
      data: null,
      errors: error,
    };
  }
}

export async function revokeAllSessionsForUser(
  userId: string,
  deviceInfo: DeviceInfo
): Promise<{
  success: boolean;
  message: string;
  data: null;
  errors: unknown | null;
}> {
  try {
    const sessions = await prisma.$transaction(async (tx) => {
      return await tx.session.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    });

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.SESSION_REVOKED,
        entity: AUDIT_LOG_ENTITY.SESSION,
        entityId: null,
        description: `All sessions revoked for user ID ${userId}`,
        metadata: {
          deviceInfo: JSON.stringify(deviceInfo),
          totalRevoked: sessions.count,
        },
        user: {
          connect: { id: userId },
        },
      });
    } catch (error) {
      console.error(
        "Failed to log audit event for revoking all sessions:",
        error
      );
    }

    return {
      success: true,
      message: "All sessions revoked successfully",
      data: null,
      errors: null,
    };
  } catch (error) {
    console.error("Failed to revoke all sessions for user:", error);
    return {
      success: false,
      message: "Failed to revoke all sessions for user",
      data: null,
      errors: error,
    };
  }
}

export async function getSessionById(sessionId: string): Promise<{
  success: boolean;
  message: string;
  data: Session | null;
  errors: unknown | null;
}> {
  try {
    const session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });

    if (!session) {
      return {
        success: false,
        message: "Session not found",
        data: null,
        errors: new Error("Session not found"),
      };
    }

    return {
      success: true,
      message: "Session retrieved successfully",
      data: session,
      errors: null,
    };
  } catch (error) {
    console.error("Failed to retrieve session by ID:", error);
    return {
      success: false,
      message: "Failed to retrieve session by ID",
      data: null,
      errors: error,
    };
  }
}

export async function revokeSessionById(
  sessionId: string,
  userId: string,
  deviceInfo: DeviceInfo
): Promise<{
  success: boolean;
  message: string;
  data: null;
  errors: unknown | null;
}> {
  try {
    const session = await prisma.$transaction(async (tx) => {
      return await tx.session.update({
        where: {
          id: sessionId,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    });

    if (!session) {
      return {
        success: false,
        message: "Session not found",
        data: null,
        errors: new Error("Session not found"),
      };
    }

    try {
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.SESSION_REVOKED,
        entity: AUDIT_LOG_ENTITY.SESSION,
        entityId: session.id,
        description: `Session ID ${sessionId} revoked by user ID ${userId}`,
        metadata: { deviceInfo: JSON.stringify(deviceInfo) },
        user: {
          connect: { id: userId },
        },
      });
    } catch (error) {
      console.error(
        "Failed to log audit event for session revocation by ID:",
        error
      );
    }

    return {
      success: true,
      message: "Session revoked successfully",
      data: null,
      errors: null,
    };
  } catch (error) {
    console.error("Failed to revoke session by ID:", error);
    return {
      success: false,
      message: "Failed to revoke session by ID",
      data: null,
      errors: error,
    };
  }
}
