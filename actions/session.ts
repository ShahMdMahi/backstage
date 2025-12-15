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

    if (!sessionToken) {
      return {
        success: false,
        message: "No session token found",
        data: null,
        errors: null,
      };
    }

    const deviceInfo = await getDeviceInfo();

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
        errors: null,
      };
    }

    if (session.expiresAt < new Date()) {
      await prisma.$transaction(async (tx) => {
        await tx.session.update({
          where: {
            token: sessionToken,
          },
          data: {
            revokedAt: new Date(),
          },
        });
      });
      return {
        success: false,
        message: "Session has expired",
        data: null,
        errors: null,
      };
    }

    if (session.revokedAt) {
      return {
        success: false,
        message: "Session has been revoked",
        data: null,
        errors: null,
      };
    }

    if (session.userAgent !== deviceInfo.userAgent) {
      await prisma.$transaction(async (tx) => {
        await tx.session.update({
          where: {
            token: sessionToken,
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
          entityId: session.id,
          description: `Session revoked due to user agent mismatch for user ID ${session.userId}`,
          metadata: {
            originalDeviceInfo: (
              session.metadata as {
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
        console.error(
          "Failed to log audit event for session revocation:",
          error
        );
      }

      return {
        success: false,
        message: "User agent mismatch",
        data: null,
        errors: null,
      };
    }

    if (session.deviceFingerprint !== deviceInfo.deviceFingerprint) {
      await prisma.$transaction(async (tx) => {
        await tx.session.update({
          where: {
            token: sessionToken,
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
          entityId: session.id,
          description: `Session revoked due to device fingerprint mismatch for user ID ${session.userId}`,
          metadata: {
            originalDeviceInfo: (
              session.metadata as {
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
        console.error(
          "Failed to log audit event for session revocation:",
          error
        );
      }

      return {
        success: false,
        message: "Device fingerprint mismatch",
        data: null,
        errors: null,
      };
    }

    if (!session.user) {
      await prisma.$transaction(async (tx) => {
        await tx.session.update({
          where: {
            token: sessionToken,
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
          entityId: session.id,
          description: `Session revoked due to missing user for user ID ${session.userId}`,
          metadata: {
            deviceInfo: JSON.stringify(deviceInfo),
          },
          user: {
            connect: { id: session.userId },
          },
        });
      } catch (error) {
        console.error(
          "Failed to log audit event for session revocation:",
          error
        );
      }
      return {
        success: false,
        message: "User associated with session not found",
        data: null,
        errors: null,
      };
    }

    if (!session.user.verifiedAt) {
      await prisma.$transaction(async (tx) => {
        await tx.session.update({
          where: {
            token: sessionToken,
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
          entityId: session.id,
          description: `Session revoked due to unverified email for user ID ${session.userId}`,
          metadata: {
            deviceInfo: JSON.stringify(deviceInfo),
          },
          user: {
            connect: { id: session.userId },
          },
        });
      } catch (error) {
        console.error(
          "Failed to log audit event for session revocation:",
          error
        );
      }
      return {
        success: false,
        message: "User email is not verified",
        data: null,
        errors: null,
      };
    }

    if (!session.user.approvedAt) {
      await prisma.$transaction(async (tx) => {
        await tx.session.update({
          where: {
            token: sessionToken,
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
          entityId: session.id,
          description: `Session revoked due to unapproved user for user ID ${session.userId}`,
          metadata: {
            deviceInfo: JSON.stringify(deviceInfo),
          },
          user: {
            connect: { id: session.userId },
          },
        });
      } catch (error) {
        console.error(
          "Failed to log audit event for session revocation:",
          error
        );
      }
      return {
        success: false,
        message: "User is not approved",
        data: null,
        errors: null,
      };
    }

    if (session.user.suspendedAt) {
      await prisma.$transaction(async (tx) => {
        await tx.session.update({
          where: {
            token: sessionToken,
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
          entityId: session.id,
          description: `Session revoked due to suspended user for user ID ${session.userId}`,
          metadata: {
            deviceInfo: JSON.stringify(deviceInfo),
          },
          user: {
            connect: { id: session.userId },
          },
        });
      } catch (error) {
        console.error(
          "Failed to log audit event for session revocation:",
          error
        );
      }
      return {
        success: false,
        message: "User is suspended",
        data: null,
        errors: null,
      };
    }

    // Optionally extend session expiration and update accessedAt

    // await prisma.$transaction(async (tx) => {
    //   await tx.session.update({
    //     where: {
    //       token: sessionToken,
    //     },
    //     data: {
    //       expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Extend by 1 day
    //       accessedAt: new Date(),
    //     },
    //   });
    // });

    // cookieManager.delete("session_token");
    // cookieManager.set("session_token", sessionToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 24 * 60 * 60, // 1 day
    // });

    // try {
    //   await logAuditEvent({
    //     action: AUDIT_LOG_ACTION.SESSION_ACCESSED,
    //     entity: AUDIT_LOG_ENTITY.SESSION,
    //     entityId: session.id,
    //     description: `Session accessed for user ID ${session.userId}`,
    //     metadata: { deviceInfo: JSON.stringify(deviceInfo) },
    //     user: {
    //       connect: { id: session.userId },
    //     },
    //   });
    // } catch (error) {
    //   console.error("Failed to log audit event for session access:", error);
    // }

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
        errors: null,
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
        errors: null,
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
          originalDeviceInfo: (
            session.metadata as { deviceInfo: string & Record<string, unknown> }
          )?.deviceInfo,
          currentDeviceInfo: JSON.stringify(deviceInfo),
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
