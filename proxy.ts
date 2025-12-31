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

  const isAuthRoute = url.pathname.startsWith("/auth");
  // System access
  const isSystemRoute = url.pathname.startsWith("/system");
  const haveSystemAccess =
    role === systemOwner || role === systemAdmin || role === systemUser;
  // System accesses access
  const isSystemAccessesRoute = url.pathname.startsWith(
    "/system/administration/accesses"
  );
  const haveSystemAccessesAccess = role === systemOwner || role === systemAdmin;
  // System users access
  const isSystemUsersRoute = url.pathname.startsWith(
    "/system/administration/users"
  );
  let haveSystemUsersAccess = role === systemOwner || role === systemAdmin;
  // System workspaces access
  const isSystemWorkspacesRoute = url.pathname.startsWith(
    "/system/administration/workspaces"
  );
  let haveSystemWorkspacesAccess = role === systemOwner || role === systemAdmin;
  // System reporting access
  const isSystemReportingRoute = url.pathname.startsWith(
    "/system/administration/reporting"
  );
  let haveSystemReportingAccess = role === systemOwner || role === systemAdmin;
  // System administration access
  const isSystemAdministrationRoute = url.pathname.startsWith(
    "/system/administration"
  );
  let haveSystemAdministrationAccess =
    haveSystemAccessesAccess ||
    haveSystemUsersAccess ||
    haveSystemWorkspacesAccess ||
    haveSystemReportingAccess;
  // System releases access
  const isSystemReleasesRoute = url.pathname.startsWith(
    "/system/catalog/assets/releases"
  );
  let haveSystemReleasesAccess = role === systemOwner || role === systemAdmin;
  // System tracks access
  const isSystemTracksRoute = url.pathname.startsWith(
    "/system/catalog/assets/tracks"
  );
  let haveSystemTracksAccess = role === systemOwner || role === systemAdmin;
  // System videos access
  const isSystemVideosRoute = url.pathname.startsWith(
    "/system/catalog/assets/videos"
  );
  let haveSystemVideosAccess = role === systemOwner || role === systemAdmin;
  // System ringtones access
  const isSystemRingtonesRoute = url.pathname.startsWith(
    "/system/catalog/assets/ringtones"
  );
  let haveSystemRingtonesAccess = role === systemOwner || role === systemAdmin;
  // System assets access
  const isSystemAssetsRoute = url.pathname.startsWith("/system/catalog/assets");
  let haveSystemAssetsAccess = role === systemOwner || role === systemAdmin;
  // System artists access
  const isSystemArtistsRoute = url.pathname.startsWith(
    "/system/catalog/contributors/artists"
  );
  let haveSystemArtistsAccess = role === systemOwner || role === systemAdmin;
  // System performers access
  const isSystemPerformersRoute = url.pathname.startsWith(
    "/system/catalog/contributors/performers"
  );
  let haveSystemPerformersAccess = role === systemOwner || role === systemAdmin;
  // System producers & engineers access
  const isSystemProducersAndEngineersRoute = url.pathname.startsWith(
    "/system/catalog/contributors/producers-and-engineers"
  );
  let haveSystemProducersAndEngineersAccess =
    role === systemOwner || role === systemAdmin;
  // System writers access
  const isSystemWritersRoute = url.pathname.startsWith(
    "/system/catalog/contributors/writers"
  );
  let haveSystemWritersAccess = role === systemOwner || role === systemAdmin;
  // System publishers access
  const isSystemPublishersRoute = url.pathname.startsWith(
    "/system/catalog/contributors/publishers"
  );
  let haveSystemPublishersAccess = role === systemOwner || role === systemAdmin;
  // System labels access
  const isSystemLabelsRoute = url.pathname.startsWith(
    "/system/catalog/contributors/labels"
  );
  let haveSystemLabelsAccess = role === systemOwner || role === systemAdmin;
  // System contributors access
  const isSystemContributorsRoute = url.pathname.startsWith(
    "/system/catalog/contributors"
  );
  let haveSystemContributorsAccess =
    haveSystemArtistsAccess ||
    haveSystemPerformersAccess ||
    haveSystemProducersAndEngineersAccess ||
    haveSystemWritersAccess ||
    haveSystemPublishersAccess ||
    haveSystemLabelsAccess;
  // System catalog access
  const isSystemCatalogRoute = url.pathname.startsWith("/system/catalog");
  let haveSystemCatalogAccess =
    haveSystemAssetsAccess || haveSystemContributorsAccess;
  // System transactions access
  const isSystemTransactionsRoute = url.pathname.startsWith(
    "/system/royalties/transactions"
  );
  let haveSystemTransactionsAccess =
    role === systemOwner || role === systemAdmin;
  // System withdraws access
  const isSystemWithdrawsRoute = url.pathname.startsWith(
    "/system/royalties/withdraws"
  );
  let haveSystemWithdrawsAccess = role === systemOwner || role === systemAdmin;
  // System royalties access
  const isSystemRoyaltiesRoute = url.pathname.startsWith("/system/royalties");
  let haveSystemRoyaltiesAccess =
    haveSystemTransactionsAccess || haveSystemWithdrawsAccess;
  // System consumption access
  const isSystemConsumptionRoute = url.pathname.startsWith(
    "/system/reports/analytics/consumption"
  );
  let haveSystemConsumptionAccess =
    role === systemOwner || role === systemAdmin;
  // System engagement access
  const isSystemEngagementRoute = url.pathname.startsWith(
    "/system/reports/analytics/engagement"
  );
  let haveSystemEngagementAccess = role === systemOwner || role === systemAdmin;
  // System revenue access
  const isSystemRevenueRoute = url.pathname.startsWith(
    "/system/reports/analytics/revenue"
  );
  let haveSystemRevenueAccess = role === systemOwner || role === systemAdmin;
  // System geo access
  const isSystemGeoRoute = url.pathname.startsWith(
    "/system/reports/analytics/geo"
  );
  let haveSystemGeoAccess = role === systemOwner || role === systemAdmin;
  // System analytics access
  const isSystemAnalyticsRoute = url.pathname.startsWith(
    "/system/reports/analytics"
  );
  let haveSystemAnalyticsAccess =
    haveSystemConsumptionAccess ||
    haveSystemEngagementAccess ||
    haveSystemRevenueAccess ||
    haveSystemGeoAccess;
  // System reports access
  const isSystemReportsRoute = url.pathname.startsWith("/system/reports");
  let haveSystemReportsAccess = haveSystemAnalyticsAccess;
  // System rights management access
  const isSystemRightsManagementRoute = url.pathname.startsWith(
    "/system/services/rights-management"
  );
  let haveSystemRightsManagementAccess =
    role === systemOwner || role === systemAdmin;
  // System services access
  const isSystemServicesRoute = url.pathname.startsWith("/system/services");
  let haveSystemServicesAccess = haveSystemRightsManagementAccess;

  // Normal access
  const isNormalRoute =
    !isAuthRoute && !isSystemRoute && !isSystemAccessesRoute;
  const haveNormalAccess =
    role === systemOwner || role === systemAdmin || role === normalUser;

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
    role = dbSession?.user.role || normalUser;
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

  if (role === systemUser) {
    try {
      systemAccess = await prisma.systemAccess.findUnique({
        where: {
          userId: dbSession?.userId,
        },
      });
      if (!systemAccess) {
        try {
          const session = await prisma.session.update({
            where: { id: dbSession?.id },
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
            metadata: {
              deviceInfo: JSON.stringify(deviceInfo),
            },
            user: {
              connect: { id: session.userId },
            },
          });
        } catch (error) {
          console.error(
            "Error revoking session due to missing system access record:",
            error
          );
        }
        response.cookies.delete("session_token");
        return response;
      }
      if (systemAccess.suspendedAt) {
        try {
          const session = await prisma.session.update({
            where: { id: dbSession?.id },
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
            metadata: {
              deviceInfo: JSON.stringify(deviceInfo),
            },
            user: {
              connect: { id: session.userId },
            },
          });
        } catch (error) {
          console.error(
            "Error revoking session for expired system access:",
            error
          );
        }
        response.cookies.delete("session_token");
        return response;
      }
      if (systemAccess.expiresAt < new Date()) {
        try {
          const session = await prisma.session.update({
            where: { id: dbSession?.id },
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
            user: {
              connect: { id: session.userId },
            },
          });
        } catch (error) {
          console.error(
            "Error revoking session for expired system access:",
            error
          );
        }
        response.cookies.delete("session_token");
        return response;
      }
      haveSystemUsersAccess = systemAccess.usersAccessLevel.length > 0;
      haveSystemWorkspacesAccess =
        systemAccess.workspaceAccountsAccessLevel.length > 0;
      haveSystemReportingAccess = systemAccess.reportingAccessLevel.length > 0;
      haveSystemAdministrationAccess =
        haveSystemUsersAccess ||
        haveSystemWorkspacesAccess ||
        haveSystemReportingAccess;
      haveSystemReleasesAccess = systemAccess.releasesAccessLevel.length > 0;
      haveSystemTracksAccess = systemAccess.tracksAccessLevel.length > 0;
      haveSystemVideosAccess = systemAccess.videosAccessLevel.length > 0;
      haveSystemRingtonesAccess = systemAccess.ringtonesAccessLevel.length > 0;
      haveSystemAssetsAccess =
        haveSystemReleasesAccess ||
        haveSystemTracksAccess ||
        haveSystemVideosAccess ||
        haveSystemRingtonesAccess;
      haveSystemArtistsAccess = systemAccess.artistsAccessLevel.length > 0;
      haveSystemPerformersAccess =
        systemAccess.performersAccessLevel.length > 0;
      haveSystemProducersAndEngineersAccess =
        systemAccess.producersAndEngineersAccessLevel.length > 0;
      haveSystemWritersAccess = systemAccess.writersAccessLevel.length > 0;
      haveSystemPublishersAccess =
        systemAccess.publishersAccessLevel.length > 0;
      haveSystemLabelsAccess = systemAccess.labelsAccessLevel.length > 0;
      haveSystemContributorsAccess =
        haveSystemArtistsAccess ||
        haveSystemPerformersAccess ||
        haveSystemProducersAndEngineersAccess ||
        haveSystemWritersAccess ||
        haveSystemPublishersAccess ||
        haveSystemLabelsAccess;
      haveSystemCatalogAccess =
        haveSystemAssetsAccess || haveSystemContributorsAccess;
      haveSystemTransactionsAccess =
        systemAccess.transactionsAccessLevel.length > 0;
      haveSystemWithdrawsAccess = systemAccess.withdrawsAccessLevel.length > 0;
      haveSystemRoyaltiesAccess =
        haveSystemTransactionsAccess || haveSystemWithdrawsAccess;
      haveSystemConsumptionAccess =
        systemAccess.consumptionAccessLevel.length > 0;
      haveSystemEngagementAccess =
        systemAccess.engagementAccessLevel.length > 0;
      haveSystemRevenueAccess = systemAccess.revenueAccessLevel.length > 0;
      haveSystemGeoAccess = systemAccess.geoAccessLevel.length > 0;
      haveSystemAnalyticsAccess =
        haveSystemConsumptionAccess ||
        haveSystemEngagementAccess ||
        haveSystemRevenueAccess ||
        haveSystemGeoAccess;
      haveSystemReportsAccess = haveSystemAnalyticsAccess;
      haveSystemRightsManagementAccess =
        systemAccess.rightsManagementAccessLevel.length > 0;
      haveSystemServicesAccess = haveSystemRightsManagementAccess;
    } catch (error) {
      console.error("Error fetching system access from database:", error);
    }
  }

  if (role === ROLE.USER) {
    try {
      sharedAccess = await prisma.sharedWorkspaceAccountAccess.findFirst({
        where: {
          userId: dbSession?.userId,
          revokedAt: null,
        },
      });
      if (!sharedAccess) {
        try {
          const session = await prisma.session.update({
            where: { id: dbSession?.id },
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
            description: `Session revoked due to missing shared workspace account access for user ID ${session.userId}`,
            metadata: {
              deviceInfo: JSON.stringify(deviceInfo),
            },
            user: {
              connect: { id: session.userId },
            },
          });
        } catch (error) {
          console.error(
            "Error revoking session due to system access suspension:",
            error
          );
        }
        response.cookies.delete("session_token");
        return response;
      }
      if (sharedAccess.suspendedAt) {
        try {
          const session = await prisma.session.update({
            where: { id: dbSession?.id },
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
            metadata: {
              deviceInfo: JSON.stringify(deviceInfo),
            },
            user: {
              connect: { id: session.userId },
            },
          });
        } catch (error) {
          console.error(
            "Error revoking session for suspended shared access:",
            error
          );
        }
        response.cookies.delete("session_token");
        return response;
      }
      if (sharedAccess.expiresAt < new Date()) {
        try {
          const session = await prisma.session.update({
            where: { id: dbSession?.id },
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
            metadata: {
              deviceInfo: JSON.stringify(deviceInfo),
            },
            user: {
              connect: { id: session.userId },
            },
          });
        } catch (error) {
          console.error(
            "Error revoking session for expired shared access:",
            error
          );
        }
        response.cookies.delete("session_token");
        return response;
      }
    } catch (error) {
      console.error("Error fetching shared access from database:", error);
    }
  }

  // System access
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
  } // System services access
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
    "/((?!api|_next/static|_next/image|icons|sw\.js|manifest\.webmanifest|offline|favicon\.ico|.*\\.(?:png|jpeg|gif|jpg|webp)$).*)",
  ],
};
