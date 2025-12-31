import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDeviceInfo } from "@/lib/device-info";
import { logAuditEvent } from "@/actions/system/audit-log";
import { AUDIT_LOG_ACTION, AUDIT_LOG_ENTITY, ROLE } from "@/lib/prisma/enums";
import {
  Session,
  SharedWorkspaceAccountAccess,
  SystemAccess,
  User,
} from "@/lib/prisma/client";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const sessionToken = request.cookies.get("session_token")?.value;
  const deviceInfo = await getDeviceInfo();
  const url = request.nextUrl.clone();

  const systemOwner = ROLE.SYSTEM_OWNER;
  const systemAdmin = ROLE.SYSTEM_ADMIN;
  const systemUser = ROLE.SYSTEM_USER;
  const normalUser = ROLE.USER;

  let dbSession: (Session & { user: User }) | null = null;
  let role: ROLE | null = null;
  let systemAccess: SystemAccess | null = null;
  let sharedAccess: SharedWorkspaceAccountAccess | null = null;

  // Route checks
  const isAuthRoute = url.pathname.startsWith("/auth");
  const isSystemRoute = url.pathname.startsWith("/system");
  const isSystemAccessesRoute = url.pathname.startsWith(
    "/system/administration/accesses"
  );
  const isSystemUsersRoute = url.pathname.startsWith(
    "/system/administration/users"
  );
  const isSystemWorkspacesRoute = url.pathname.startsWith(
    "/system/administration/workspaces"
  );
  const isSystemReportingRoute = url.pathname.startsWith(
    "/system/administration/reporting"
  );
  const isSystemAdministrationRoute = url.pathname.startsWith(
    "/system/administration"
  );
  const isSystemReleasesRoute = url.pathname.startsWith(
    "/system/catalog/assets/releases"
  );
  const isSystemTracksRoute = url.pathname.startsWith(
    "/system/catalog/assets/tracks"
  );
  const isSystemVideosRoute = url.pathname.startsWith(
    "/system/catalog/assets/videos"
  );
  const isSystemRingtonesRoute = url.pathname.startsWith(
    "/system/catalog/assets/ringtones"
  );
  const isSystemAssetsRoute = url.pathname.startsWith("/system/catalog/assets");
  const isSystemArtistsRoute = url.pathname.startsWith(
    "/system/catalog/contributors/artists"
  );
  const isSystemPerformersRoute = url.pathname.startsWith(
    "/system/catalog/contributors/performers"
  );
  const isSystemProducersAndEngineersRoute = url.pathname.startsWith(
    "/system/catalog/contributors/producers-and-engineers"
  );
  const isSystemWritersRoute = url.pathname.startsWith(
    "/system/catalog/contributors/writers"
  );
  const isSystemPublishersRoute = url.pathname.startsWith(
    "/system/catalog/contributors/publishers"
  );
  const isSystemLabelsRoute = url.pathname.startsWith(
    "/system/catalog/contributors/labels"
  );
  const isSystemContributorsRoute = url.pathname.startsWith(
    "/system/catalog/contributors"
  );
  const isSystemCatalogRoute = url.pathname.startsWith("/system/catalog");
  const isSystemTransactionsRoute = url.pathname.startsWith(
    "/system/royalties/transactions"
  );
  const isSystemWithdrawsRoute = url.pathname.startsWith(
    "/system/royalties/withdraws"
  );
  const isSystemRoyaltiesRoute = url.pathname.startsWith("/system/royalties");
  const isSystemConsumptionRoute = url.pathname.startsWith(
    "/system/reports/analytics/consumption"
  );
  const isSystemEngagementRoute = url.pathname.startsWith(
    "/system/reports/analytics/engagement"
  );
  const isSystemRevenueRoute = url.pathname.startsWith(
    "/system/reports/analytics/revenue"
  );
  const isSystemGeoRoute = url.pathname.startsWith(
    "/system/reports/analytics/geo"
  );
  const isSystemAnalyticsRoute = url.pathname.startsWith(
    "/system/reports/analytics"
  );
  const isSystemReportsRoute = url.pathname.startsWith("/system/reports");
  const isSystemRightsManagementRoute = url.pathname.startsWith(
    "/system/services/rights-management"
  );
  const isSystemServicesRoute = url.pathname.startsWith("/system/services");
  const isNormalRoute = !isAuthRoute && !isSystemRoute;

  // ============================================================================
  // PHASE 1: Session Token Check
  // ============================================================================
  if (!sessionToken) {
    if (!isAuthRoute) {
      response.cookies.delete("session_token");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return response;
  }

  // ============================================================================
  // PHASE 2: Fetch Session and Role
  // ============================================================================
  try {
    dbSession = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });
    role = dbSession?.user.role || null;
  } catch (error) {
    console.error("Error fetching session from database:", error);
    response.cookies.delete("session_token");
    if (!isAuthRoute) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return response;
  }

  // ============================================================================
  // PHASE 3: Session Validation
  // ============================================================================
  if (!dbSession || !dbSession.user) {
    response.cookies.delete("session_token");
    if (!isAuthRoute) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return response;
  }

  // Check session expiry
  if (dbSession.expiresAt < new Date()) {
    response.cookies.delete("session_token");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Check if session is revoked
  if (dbSession.revokedAt) {
    response.cookies.delete("session_token");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Check user agent mismatch
  if (dbSession.userAgent !== deviceInfo.userAgent) {
    try {
      const session = await prisma.session.update({
        where: { id: dbSession.id },
        data: {
          revokedAt: new Date(),
          metadata: {
            revokedReason: "User agent mismatch",
            deviceInfo: (
              dbSession.metadata as {
                deviceInfo: string & Record<string, unknown>;
              }
            )?.deviceInfo,
            newDeviceInfo: JSON.stringify(deviceInfo),
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
            session.metadata as { deviceInfo: string & Record<string, unknown> }
          )?.deviceInfo,
          currentDeviceInfo: JSON.stringify(deviceInfo),
        },
        user: { connect: { id: session.userId } },
      });
    } catch (error) {
      console.error("Error revoking session:", error);
    }
    response.cookies.delete("session_token");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Check device fingerprint mismatch
  if (dbSession.deviceFingerprint !== deviceInfo.deviceFingerprint) {
    try {
      const session = await prisma.session.update({
        where: { id: dbSession.id },
        data: {
          revokedAt: new Date(),
          metadata: {
            revokedReason: "Device fingerprint mismatch",
            deviceInfo: (
              dbSession.metadata as {
                deviceInfo: string & Record<string, unknown>;
              }
            )?.deviceInfo,
            newDeviceInfo: JSON.stringify(deviceInfo),
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
            session.metadata as { deviceInfo: string & Record<string, unknown> }
          )?.deviceInfo,
          currentDeviceInfo: JSON.stringify(deviceInfo),
        },
        user: { connect: { id: session.userId } },
      });
    } catch (error) {
      console.error("Error revoking session:", error);
    }
    response.cookies.delete("session_token");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Check if user is verified
  if (!dbSession.user.verifiedAt) {
    try {
      const session = await prisma.session.update({
        where: { id: dbSession.id },
        data: {
          revokedAt: new Date(),
          metadata: {
            revokedReason: "User not verified",
            deviceInfo: JSON.stringify(deviceInfo),
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
            session.metadata as { deviceInfo: string & Record<string, unknown> }
          )?.deviceInfo,
          currentDeviceInfo: JSON.stringify(deviceInfo),
        },
        user: { connect: { id: session.userId } },
      });
    } catch (error) {
      console.error("Error logging audit event for unverified user:", error);
    }
    response.cookies.delete("session_token");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Check if user is approved
  if (!dbSession.user.approvedAt) {
    try {
      const session = await prisma.session.update({
        where: { id: dbSession.id },
        data: {
          revokedAt: new Date(),
          metadata: {
            revokedReason: "User not approved",
            deviceInfo: JSON.stringify(deviceInfo),
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
            session.metadata as { deviceInfo: string & Record<string, unknown> }
          )?.deviceInfo,
          currentDeviceInfo: JSON.stringify(deviceInfo),
        },
        user: { connect: { id: session.userId } },
      });
    } catch (error) {
      console.error("Error logging audit event for unapproved user:", error);
    }
    response.cookies.delete("session_token");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Check if user is suspended
  if (dbSession.user.suspendedAt) {
    try {
      const session = await prisma.session.update({
        where: { id: dbSession.id },
        data: {
          revokedAt: new Date(),
          metadata: {
            revokedReason: "User suspended",
            deviceInfo: JSON.stringify(deviceInfo),
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
            session.metadata as { deviceInfo: string & Record<string, unknown> }
          )?.deviceInfo,
          currentDeviceInfo: JSON.stringify(deviceInfo),
        },
        user: { connect: { id: session.userId } },
      });
    } catch (error) {
      console.error("Error logging audit event for suspended user:", error);
    }
    response.cookies.delete("session_token");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Update session access info
  try {
    await prisma.session.update({
      where: { id: dbSession.id },
      data: {
        ipAddress: deviceInfo.ipAddress,
        accessedAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // Extend session expiry by 1 day
      },
    });
    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
    });
  } catch (error) {
    console.error("Error updating session access info:", error);
  }

  // ============================================================================
  // PHASE 4: Fetch Additional Access Records Based on Role
  // ============================================================================
  if (role === systemUser) {
    try {
      systemAccess = await prisma.systemAccess.findUnique({
        where: { userId: dbSession.userId },
      });

      if (!systemAccess) {
        try {
          const session = await prisma.session.update({
            where: { id: dbSession.id },
            data: {
              revokedAt: new Date(),
              ipAddress: deviceInfo.ipAddress,
              metadata: {
                revokedReason: "Missing system access record",
                deviceInfo: JSON.stringify(deviceInfo),
              },
            },
          });
          await logAuditEvent({
            action: AUDIT_LOG_ACTION.SESSION_REVOKED,
            entity: AUDIT_LOG_ENTITY.SESSION,
            entityId: session.id,
            description: `Session revoked due to missing system access record for user ID ${session.userId}`,
            metadata: { deviceInfo: JSON.stringify(deviceInfo) },
            user: { connect: { id: session.userId } },
          });
        } catch (error) {
          console.error(
            "Error revoking session due to missing system access record:",
            error
          );
        }
        response.cookies.delete("session_token");
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      if (systemAccess.suspendedAt) {
        try {
          const session = await prisma.session.update({
            where: { id: dbSession.id },
            data: {
              revokedAt: new Date(),
              ipAddress: deviceInfo.ipAddress,
              metadata: {
                revokedReason: "System access suspended",
                deviceInfo: JSON.stringify(deviceInfo),
              },
            },
          });
          await logAuditEvent({
            action: AUDIT_LOG_ACTION.SESSION_REVOKED,
            entity: AUDIT_LOG_ENTITY.SESSION,
            entityId: session.id,
            description: `Session revoked due to suspended system access for user ID ${session.userId}`,
            metadata: { deviceInfo: JSON.stringify(deviceInfo) },
            user: { connect: { id: session.userId } },
          });
        } catch (error) {
          console.error(
            "Error revoking session for suspended system access:",
            error
          );
        }
        response.cookies.delete("session_token");
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      if (systemAccess.expiresAt < new Date()) {
        try {
          const session = await prisma.session.update({
            where: { id: dbSession.id },
            data: {
              revokedAt: new Date(),
              ipAddress: deviceInfo.ipAddress,
              metadata: {
                revokedReason: "System access expired",
                deviceInfo: JSON.stringify(deviceInfo),
              },
            },
          });
          await logAuditEvent({
            action: AUDIT_LOG_ACTION.SESSION_REVOKED,
            entity: AUDIT_LOG_ENTITY.SESSION,
            entityId: session.id,
            description: `Session revoked due to expired system access for user ID ${session.userId}`,
            metadata: {
              originalDeviceInfo: (
                session.metadata as {
                  deviceInfo: string & Record<string, unknown>;
                }
              )?.deviceInfo,
              currentDeviceInfo: JSON.stringify(deviceInfo),
            },
            user: { connect: { id: session.userId } },
          });
        } catch (error) {
          console.error(
            "Error revoking session for expired system access:",
            error
          );
        }
        response.cookies.delete("session_token");
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    } catch (error) {
      console.error("Error fetching system access from database:", error);
      response.cookies.delete("session_token");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  if (role === normalUser) {
    try {
      sharedAccess = await prisma.sharedWorkspaceAccountAccess.findFirst({
        where: {
          userId: dbSession.userId,
          revokedAt: null,
        },
      });

      if (!sharedAccess) {
        try {
          const session = await prisma.session.update({
            where: { id: dbSession.id },
            data: {
              revokedAt: new Date(),
              ipAddress: deviceInfo.ipAddress,
              metadata: {
                revokedReason: "Missing shared workspace account access",
                deviceInfo: JSON.stringify(deviceInfo),
              },
            },
          });
          await logAuditEvent({
            action: AUDIT_LOG_ACTION.SESSION_REVOKED,
            entity: AUDIT_LOG_ENTITY.SESSION,
            entityId: session.id,
            description: `Session revoked due to missing shared workspace account access for user ID ${session.userId}`,
            metadata: { deviceInfo: JSON.stringify(deviceInfo) },
            user: { connect: { id: session.userId } },
          });
        } catch (error) {
          console.error(
            "Error revoking session due to missing shared access:",
            error
          );
        }
        response.cookies.delete("session_token");
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      if (sharedAccess.suspendedAt) {
        try {
          const session = await prisma.session.update({
            where: { id: dbSession.id },
            data: {
              revokedAt: new Date(),
              ipAddress: deviceInfo.ipAddress,
              metadata: {
                revokedReason: "Shared access suspended",
                deviceInfo: JSON.stringify(deviceInfo),
              },
            },
          });
          await logAuditEvent({
            action: AUDIT_LOG_ACTION.SESSION_REVOKED,
            entity: AUDIT_LOG_ENTITY.SESSION,
            entityId: session.id,
            description: `Session revoked due to suspended shared access for user ID ${session.userId}`,
            metadata: { deviceInfo: JSON.stringify(deviceInfo) },
            user: { connect: { id: session.userId } },
          });
        } catch (error) {
          console.error(
            "Error revoking session for suspended shared access:",
            error
          );
        }
        response.cookies.delete("session_token");
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      if (sharedAccess.expiresAt < new Date()) {
        try {
          const session = await prisma.session.update({
            where: { id: dbSession.id },
            data: {
              revokedAt: new Date(),
              ipAddress: deviceInfo.ipAddress,
              metadata: {
                revokedReason: "Shared access expired",
                deviceInfo: JSON.stringify(deviceInfo),
              },
            },
          });
          await logAuditEvent({
            action: AUDIT_LOG_ACTION.SESSION_REVOKED,
            entity: AUDIT_LOG_ENTITY.SESSION,
            entityId: session.id,
            description: `Session revoked due to expired shared access for user ID ${session.userId}`,
            metadata: { deviceInfo: JSON.stringify(deviceInfo) },
            user: { connect: { id: session.userId } },
          });
        } catch (error) {
          console.error(
            "Error revoking session for expired shared access:",
            error
          );
        }
        response.cookies.delete("session_token");
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    } catch (error) {
      console.error("Error fetching shared access from database:", error);
      response.cookies.delete("session_token");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // ============================================================================
  // PHASE 5: Calculate All Permissions (NOW role is properly set)
  // ============================================================================

  // System access permissions
  let haveSystemUsersAccess = role === systemOwner || role === systemAdmin;
  let haveSystemWorkspacesAccess = role === systemOwner || role === systemAdmin;
  let haveSystemReportingAccess = role === systemOwner || role === systemAdmin;
  let haveSystemReleasesAccess = role === systemOwner || role === systemAdmin;
  let haveSystemTracksAccess = role === systemOwner || role === systemAdmin;
  let haveSystemVideosAccess = role === systemOwner || role === systemAdmin;
  let haveSystemRingtonesAccess = role === systemOwner || role === systemAdmin;
  let haveSystemArtistsAccess = role === systemOwner || role === systemAdmin;
  let haveSystemPerformersAccess = role === systemOwner || role === systemAdmin;
  let haveSystemProducersAndEngineersAccess =
    role === systemOwner || role === systemAdmin;
  let haveSystemWritersAccess = role === systemOwner || role === systemAdmin;
  let haveSystemPublishersAccess = role === systemOwner || role === systemAdmin;
  let haveSystemLabelsAccess = role === systemOwner || role === systemAdmin;
  let haveSystemTransactionsAccess =
    role === systemOwner || role === systemAdmin;
  let haveSystemWithdrawsAccess = role === systemOwner || role === systemAdmin;
  let haveSystemConsumptionAccess =
    role === systemOwner || role === systemAdmin;
  let haveSystemEngagementAccess = role === systemOwner || role === systemAdmin;
  let haveSystemRevenueAccess = role === systemOwner || role === systemAdmin;
  let haveSystemGeoAccess = role === systemOwner || role === systemAdmin;
  let haveSystemRightsManagementAccess =
    role === systemOwner || role === systemAdmin;

  // Override permissions for systemUser based on their systemAccess record
  if (role === systemUser && systemAccess) {
    haveSystemUsersAccess = systemAccess.usersAccessLevel.length > 0;
    haveSystemWorkspacesAccess =
      systemAccess.workspaceAccountsAccessLevel.length > 0;
    haveSystemReportingAccess = systemAccess.reportingAccessLevel.length > 0;
    haveSystemReleasesAccess = systemAccess.releasesAccessLevel.length > 0;
    haveSystemTracksAccess = systemAccess.tracksAccessLevel.length > 0;
    haveSystemVideosAccess = systemAccess.videosAccessLevel.length > 0;
    haveSystemRingtonesAccess = systemAccess.ringtonesAccessLevel.length > 0;
    haveSystemArtistsAccess = systemAccess.artistsAccessLevel.length > 0;
    haveSystemPerformersAccess = systemAccess.performersAccessLevel.length > 0;
    haveSystemProducersAndEngineersAccess =
      systemAccess.producersAndEngineersAccessLevel.length > 0;
    haveSystemWritersAccess = systemAccess.writersAccessLevel.length > 0;
    haveSystemPublishersAccess = systemAccess.publishersAccessLevel.length > 0;
    haveSystemLabelsAccess = systemAccess.labelsAccessLevel.length > 0;
    haveSystemTransactionsAccess =
      systemAccess.transactionsAccessLevel.length > 0;
    haveSystemWithdrawsAccess = systemAccess.withdrawsAccessLevel.length > 0;
    haveSystemConsumptionAccess =
      systemAccess.consumptionAccessLevel.length > 0;
    haveSystemEngagementAccess = systemAccess.engagementAccessLevel.length > 0;
    haveSystemRevenueAccess = systemAccess.revenueAccessLevel.length > 0;
    haveSystemGeoAccess = systemAccess.geoAccessLevel.length > 0;
    haveSystemRightsManagementAccess =
      systemAccess.rightsManagementAccessLevel.length > 0;
  }

  // Calculated composite permissions
  const haveSystemAdministrationAccess =
    haveSystemUsersAccess ||
    haveSystemWorkspacesAccess ||
    haveSystemReportingAccess;
  const haveSystemAssetsAccess =
    haveSystemReleasesAccess ||
    haveSystemTracksAccess ||
    haveSystemVideosAccess ||
    haveSystemRingtonesAccess;
  const haveSystemContributorsAccess =
    haveSystemArtistsAccess ||
    haveSystemPerformersAccess ||
    haveSystemProducersAndEngineersAccess ||
    haveSystemWritersAccess ||
    haveSystemPublishersAccess ||
    haveSystemLabelsAccess;
  const haveSystemCatalogAccess =
    haveSystemAssetsAccess || haveSystemContributorsAccess;
  const haveSystemRoyaltiesAccess =
    haveSystemTransactionsAccess || haveSystemWithdrawsAccess;
  const haveSystemAnalyticsAccess =
    haveSystemConsumptionAccess ||
    haveSystemEngagementAccess ||
    haveSystemRevenueAccess ||
    haveSystemGeoAccess;
  const haveSystemReportsAccess = haveSystemAnalyticsAccess;
  const haveSystemServicesAccess = haveSystemRightsManagementAccess;
  const haveSystemAccessesAccess = role === systemOwner || role === systemAdmin;

  // Top-level system access
  const haveSystemAccess =
    role === systemOwner || role === systemAdmin || role === systemUser;

  // Normal route access
  const haveNormalAccess =
    role === systemOwner || role === systemAdmin || role === normalUser;

  // ============================================================================
  // PHASE 6: Access Control and Redirects
  // ============================================================================

  // System access check
  if (isSystemRoute && !haveSystemAccess) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System administration access
  if (isSystemAdministrationRoute && !haveSystemAdministrationAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System accesses access
  if (isSystemAccessesRoute && !haveSystemAccessesAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System users access
  if (isSystemUsersRoute && !haveSystemUsersAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System workspaces access
  if (isSystemWorkspacesRoute && !haveSystemWorkspacesAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System reporting access
  if (isSystemReportingRoute && !haveSystemReportingAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System catalog access
  if (isSystemCatalogRoute && !haveSystemCatalogAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System assets access
  if (isSystemAssetsRoute && !haveSystemAssetsAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System releases access
  if (isSystemReleasesRoute && !haveSystemReleasesAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System tracks access
  if (isSystemTracksRoute && !haveSystemTracksAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System videos access
  if (isSystemVideosRoute && !haveSystemVideosAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System ringtones access
  if (isSystemRingtonesRoute && !haveSystemRingtonesAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System contributors access
  if (isSystemContributorsRoute && !haveSystemContributorsAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System artists access
  if (isSystemArtistsRoute && !haveSystemArtistsAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System performers access
  if (isSystemPerformersRoute && !haveSystemPerformersAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System producers & engineers access
  if (
    isSystemProducersAndEngineersRoute &&
    !haveSystemProducersAndEngineersAccess
  ) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System writers access
  if (isSystemWritersRoute && !haveSystemWritersAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System publishers access
  if (isSystemPublishersRoute && !haveSystemPublishersAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System labels access
  if (isSystemLabelsRoute && !haveSystemLabelsAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System royalties access
  if (isSystemRoyaltiesRoute && !haveSystemRoyaltiesAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System transactions access
  if (isSystemTransactionsRoute && !haveSystemTransactionsAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System withdraws access
  if (isSystemWithdrawsRoute && !haveSystemWithdrawsAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System reports access
  if (isSystemReportsRoute && !haveSystemReportsAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System analytics access
  if (isSystemAnalyticsRoute && !haveSystemAnalyticsAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System consumption access
  if (isSystemConsumptionRoute && !haveSystemConsumptionAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System engagement access
  if (isSystemEngagementRoute && !haveSystemEngagementAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System revenue access
  if (isSystemRevenueRoute && !haveSystemRevenueAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System geo access
  if (isSystemGeoRoute && !haveSystemGeoAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System services access
  if (isSystemServicesRoute && !haveSystemServicesAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // System rights management access
  if (isSystemRightsManagementRoute && !haveSystemRightsManagementAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal access
  if (isNormalRoute && !haveNormalAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    response.cookies.delete("session_token");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Exclude API routes, static files, image optimizations, image files (.png, .jpeg, .gif, .jpg, .webp), sw.js, manifest.json, and favicon.ico
    "/((?!api|_next/static|_next/image|icons|sw\\.js|manifest\\.webmanifest|offline|favicon\\.ico|.*\\.(?:png|jpeg|gif|jpg|webp)$).*)",
  ],
};
