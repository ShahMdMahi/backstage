import { NextResponse, NextRequest } from "next/server";
import { prisma } from "./lib/prisma";
import { getDeviceInfo } from "./lib/device-info";
import { logAuditEvent } from "./actions/audit-log";
import { AUDIT_LOG_ACTION, AUDIT_LOG_ENTITY } from "./lib/prisma/enums";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const sessionToken = request.cookies.get("session_token")?.value;
  const deviceInfo = await getDeviceInfo();
  const url = request.nextUrl.clone();
  const isAuthRoute = url.pathname.startsWith("/auth");
  let dbSession = null;

  if (!sessionToken) {
    if (!isAuthRoute) {
      response.cookies.delete("session_token");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return response;
  }

  try {
    dbSession = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: {
        user: true,
      },
    });
  } catch (error) {
    console.error("Error fetching session from database:", error);
  }

  if (dbSession && dbSession.user) {
    if (dbSession.expiresAt < new Date()) {
      response.cookies.delete("session_token");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    if (dbSession.revokedAt) {
      response.cookies.delete("session_token");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    if (dbSession.userAgent !== deviceInfo.userAgent) {
      try {
        const session = await prisma.session.update({
          where: { id: dbSession.id },
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
        console.error("Error revoking session:", error);
      }
      response.cookies.delete("session_token");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    if (dbSession.deviceFingerprint !== deviceInfo.deviceFingerprint) {
      try {
        const session = await prisma.session.update({
          where: { id: dbSession.id },
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
        console.error("Error revoking session:", error);
      }
      response.cookies.delete("session_token");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    if (!dbSession.user.verifiedAt) {
      try {
        const session = await prisma.session.update({
          where: { id: dbSession.id },
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
          entityId: session.id,
          description: `Session revoked due to unverified user for user ID ${session.userId}`,
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
        console.error("Error logging audit event for unverified user:", error);
      }
      response.cookies.delete("session_token");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    if (!dbSession.user.approvedAt) {
      try {
        const session = await prisma.session.update({
          where: { id: dbSession.id },
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
          entityId: session.id,
          description: `Session revoked due to unapproved user for user ID ${session.userId}`,
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
        console.error("Error logging audit event for unapproved user:", error);
      }
      response.cookies.delete("session_token");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    if (dbSession.user.suspendedAt) {
      try {
        const session = await prisma.session.update({
          where: { id: dbSession.id },
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
          entityId: session.id,
          description: `Session revoked due to suspended user for user ID ${session.userId}`,
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
        console.error("Error logging audit event for suspended user:", error);
      }
      response.cookies.delete("session_token");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    try {
      await prisma.session.update({
        where: { id: dbSession.id },
        data: {
          ipAddress: deviceInfo.ipAddress,
          accessedAt: new Date(),
          expiresAt: new Date(
            Date.now() + 1000 * 60 * 60 * 24 // Extend session expiry by 1 day
          ),
        },
      });
      response.cookies.delete("session_token");
      response.cookies.set("session_token", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(
          Date.now() + 1000 * 60 * 60 * 24 // 1 day
        ),
      });
      await logAuditEvent({
        action: AUDIT_LOG_ACTION.SESSION_ACCESSED,
        entity: AUDIT_LOG_ENTITY.SESSION,
        entityId: dbSession.id,
        description: `Session accessed for user ID ${dbSession.userId}`,
        user: {
          connect: { id: dbSession.userId },
        },
      });
    } catch (error) {
      console.error("Error updating session access info:", error);
    }
  } else {
    response.cookies.delete("session_token");
    if (!isAuthRoute) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    // Exclude API routes, static files, image optimizations, image files (.png, .jpeg, .gif, .jpg, .webp), sw.js, manifest.json, and favicon.ico
    "/((?!api|_next/static|_next/image|sw\.js|manifest\.webmanifest|offline|favicon\.ico|.*\\.(?:png|jpeg|gif|jpg|webp)$).*)",
  ],
};
