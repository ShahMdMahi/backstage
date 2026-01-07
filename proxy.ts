import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDeviceInfo } from "@/lib/device-info";
import { logAuditEvent } from "@/actions/shared/audit-log";
import {
  AUDIT_LOG_ACTION,
  AUDIT_LOG_ENTITY,
  ROLE,
  WORKSPACE_ACCOUNT_ACCESS_ROLE,
  USER_SYSTEM_ACCESS_LEVEL,
  WORKSPACE_ACCOUNT_SYSTEM_ACCESS_LEVEL,
  REPORTING_SYSTEM_ACCESS_LEVEL,
  RELEASE_SYSTEM_ACCESS_LEVEL,
  TRACK_SYSTEM_ACCESS_LEVEL,
  VIDEO_SYSTEM_ACCESS_LEVEL,
  RINGTONE_SYSTEM_ACCESS_LEVEL,
  ARTIST_SYSTEM_ACCESS_LEVEL,
  PERFORMER_SYSTEM_ACCESS_LEVEL,
  PRODUCER_AND_ENGINEER_SYSTEM_ACCESS_LEVEL,
  WRITER_SYSTEM_ACCESS_LEVEL,
  PUBLISHER_SYSTEM_ACCESS_LEVEL,
  LABEL_SYSTEM_ACCESS_LEVEL,
  TRANSACTION_SYSTEM_ACCESS_LEVEL,
  WITHDRAW_SYSTEM_ACCESS_LEVEL,
  CONSUMPTION_SYSTEM_ACCESS_LEVEL,
  ENGAGEMENT_SYSTEM_ACCESS_LEVEL,
  REVENUE_SYSTEM_ACCESS_LEVEL,
  GEO_SYSTEM_ACCESS_LEVEL,
  RIGHTS_MANAGEMENT_SYSTEM_ACCESS_LEVEL,
} from "@/lib/prisma/enums";
import {
  Session,
  SharedWorkspaceAccountAccess,
  SystemAccess,
  User,
  WorkspaceAccount,
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
  let ownWorkspaceAccount: WorkspaceAccount | null = null;
  let sharedAccess: SharedWorkspaceAccountAccess | null = null;
  let isSharedAccessAdmin = false;

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
  const isSystemCatalogRoute = url.pathname.startsWith("/system/catalog");
  const isSystemAssetsRoute = url.pathname.startsWith("/system/catalog/assets");
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
  const isSystemContributorsRoute = url.pathname.startsWith(
    "/system/catalog/contributors"
  );
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
  const isSystemRoyaltiesRoute = url.pathname.startsWith("/system/royalties");
  const isSystemTransactionsRoute = url.pathname.startsWith(
    "/system/royalties/transactions"
  );
  const isSystemWithdrawsRoute = url.pathname.startsWith(
    "/system/royalties/withdraws"
  );
  const isSystemReportsRoute = url.pathname.startsWith("/system/reports");
  const isSystemAnalyticsRoute = url.pathname.startsWith(
    "/system/reports/analytics"
  );
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
  const isSystemServicesRoute = url.pathname.startsWith("/system/services");
  const isSystemRightsManagementRoute = url.pathname.startsWith(
    "/system/services/rights-management"
  );
  const isNormalRoute = !isAuthRoute && !isSystemRoute;
  const isNormalAdministrationRoute =
    url.pathname.startsWith("/administration");
  const isNormalWorkspacesRoute = url.pathname.startsWith(
    "/administration/workspaces"
  );
  const isNormalAccessesRoute = url.pathname.startsWith(
    "/administration/accesses"
  );
  const isNormalCatalogRoute = url.pathname.startsWith("/catalog");
  const isNormalAssetsRoute = url.pathname.startsWith("/catalog/assets");
  const isNormalReleasesRoute = url.pathname.startsWith(
    "/catalog/assets/releases"
  );
  const isNormalTracksRoute = url.pathname.startsWith("/catalog/assets/tracks");
  const isNormalVideosRoute = url.pathname.startsWith("/catalog/assets/videos");
  const isNormalRingtonesRoute = url.pathname.startsWith(
    "/catalog/assets/ringtones"
  );
  const isNormalContributorsRoute = url.pathname.startsWith(
    "/catalog/contributors"
  );
  const isNormalArtistsRoute = url.pathname.startsWith(
    "/catalog/contributors/artists"
  );
  const isNormalPerformersRoute = url.pathname.startsWith(
    "/catalog/contributors/performers"
  );
  const isNormalProducersAndEngineersRoute = url.pathname.startsWith(
    "/catalog/contributors/producers-and-engineers"
  );
  const isNormalWritersRoute = url.pathname.startsWith(
    "/catalog/contributors/writers"
  );
  const isNormalPublishersRoute = url.pathname.startsWith(
    "/catalog/contributors/publishers"
  );
  const isNormalLabelsRoute = url.pathname.startsWith(
    "/catalog/contributors/labels"
  );
  const isNormalRoyaltiesRoute = url.pathname.startsWith("/royalties");
  const isNormalTransactionsRoute = url.pathname.startsWith(
    "/royalties/transactions"
  );
  const isNormalWithdrawsRoute = url.pathname.startsWith(
    "/royalties/withdraws"
  );
  const isNormalReportsRoute = url.pathname.startsWith("/reports");
  const isNormalAnalyticsRoute = url.pathname.startsWith("/reports/analytics");
  const isNormalConsumptionRoute = url.pathname.startsWith(
    "/reports/analytics/consumption"
  );
  const isNormalEngagementRoute = url.pathname.startsWith(
    "/reports/analytics/engagement"
  );
  const isNormalRevenueRoute = url.pathname.startsWith(
    "/reports/analytics/revenue"
  );
  const isNormalGeoRoute = url.pathname.startsWith("/reports/analytics/geo");

  // ============================================================================
  // PHASE 1: Session Token Check
  // ============================================================================
  if (!sessionToken) {
    if (!isAuthRoute) {
      const redirect = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      redirect.cookies.delete("session_token");
      return redirect;
    }
    response.cookies.delete("session_token");
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
    if (!isAuthRoute) {
      const redirect = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      redirect.cookies.delete("session_token");
      return redirect;
    }
    response.cookies.delete("session_token");
    return response;
  }

  // ============================================================================
  // PHASE 3: Session Validation
  // ============================================================================
  if (!dbSession || !dbSession.user) {
    if (!isAuthRoute) {
      const redirect = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      redirect.cookies.delete("session_token");
      return redirect;
    }
    response.cookies.delete("session_token");
    return response;
  }

  // Check session expiry
  if (dbSession.expiresAt < new Date()) {
    if (!isAuthRoute) {
      const redirect = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      redirect.cookies.delete("session_token");
      return redirect;
    }
    response.cookies.delete("session_token");
    return response;
  }

  // Check if session is revoked
  if (dbSession.revokedAt) {
    if (!isAuthRoute) {
      const redirect = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      redirect.cookies.delete("session_token");
      return redirect;
    }
    response.cookies.delete("session_token");
    return response;
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
          user: { connect: { id: session.userId } },
        });
      } catch (error) {
        console.error(
          "Error logging audit event for user agent mismatch:",
          error
        );
      }
    } catch (error) {
      console.error("Error revoking session:", error);
    }
    if (!isAuthRoute) {
      const redirect = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      redirect.cookies.delete("session_token");
      return redirect;
    }
    response.cookies.delete("session_token");
    return response;
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
          user: { connect: { id: session.userId } },
        });
      } catch (error) {
        console.error(
          "Error logging audit event for device fingerprint mismatch:",
          error
        );
      }
    } catch (error) {
      console.error("Error revoking session:", error);
    }
    if (!isAuthRoute) {
      const redirect = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      redirect.cookies.delete("session_token");
      return redirect;
    }
    response.cookies.delete("session_token");
    return response;
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
      try {
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
          user: { connect: { id: session.userId } },
        });
      } catch (error) {
        console.error("Error logging audit event for unverified user:", error);
      }
    } catch (error) {
      console.error("Error logging audit event for unverified user:", error);
    }
    if (!isAuthRoute) {
      const redirect = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      redirect.cookies.delete("session_token");
      return redirect;
    }
    response.cookies.delete("session_token");
    return response;
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
      try {
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
          user: { connect: { id: session.userId } },
        });
      } catch (error) {
        console.error("Error logging audit event for unapproved user:", error);
      }
    } catch (error) {
      console.error("Error logging audit event for unapproved user:", error);
    }
    if (!isAuthRoute) {
      const redirect = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      redirect.cookies.delete("session_token");
      return redirect;
    }
    response.cookies.delete("session_token");
    return response;
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
      try {
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
          user: { connect: { id: session.userId } },
        });
      } catch (error) {
        console.error("Error logging audit event for suspended user:", error);
      }
    } catch (error) {
      console.error("Error logging audit event for suspended user:", error);
    }
    if (!isAuthRoute) {
      const redirect = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      redirect.cookies.delete("session_token");
      return redirect;
    }
    response.cookies.delete("session_token");
    return response;
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
          try {
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
              "Error logging audit event for missing system access record:",
              error
            );
          }
        } catch (error) {
          console.error(
            "Error revoking session due to missing system access record:",
            error
          );
        }
        if (!isAuthRoute) {
          const redirect = NextResponse.redirect(
            new URL("/auth/login", request.url)
          );
          redirect.cookies.delete("session_token");
          return redirect;
        }
        response.cookies.delete("session_token");
        return response;
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
          try {
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
              "Error logging audit event for suspended system access:",
              error
            );
          }
        } catch (error) {
          console.error(
            "Error revoking session for suspended system access:",
            error
          );
        }
        if (!isAuthRoute) {
          const redirect = NextResponse.redirect(
            new URL("/auth/login", request.url)
          );
          redirect.cookies.delete("session_token");
          return redirect;
        }
        response.cookies.delete("session_token");
        return response;
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
          try {
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
              "Error logging audit event for expired system access:",
              error
            );
          }
        } catch (error) {
          console.error(
            "Error revoking session for expired system access:",
            error
          );
        }
        if (!isAuthRoute) {
          const redirect = NextResponse.redirect(
            new URL("/auth/login", request.url)
          );
          redirect.cookies.delete("session_token");
          return redirect;
        }
        response.cookies.delete("session_token");
        return response;
      }
    } catch (error) {
      console.error("Error fetching system access from database:", error);
      if (!isAuthRoute) {
        const redirect = NextResponse.redirect(
          new URL("/auth/login", request.url)
        );
        redirect.cookies.delete("session_token");
        return redirect;
      }
      response.cookies.delete("session_token");
      return response;
    }
  }

  if (role === normalUser) {
    try {
      ownWorkspaceAccount = await prisma.workspaceAccount.findUnique({
        where: { ownerId: dbSession.userId },
      });
      sharedAccess = await prisma.sharedWorkspaceAccountAccess.findUnique({
        where: { userId: dbSession.userId },
      });
      isSharedAccessAdmin =
        sharedAccess?.role === WORKSPACE_ACCOUNT_ACCESS_ROLE.ADMIN;
      if (!ownWorkspaceAccount && !sharedAccess) {
        try {
          const session = await prisma.session.update({
            where: { id: dbSession.id },
            data: {
              revokedAt: new Date(),
              ipAddress: deviceInfo.ipAddress,
              metadata: {
                revokedReason: "Missing workspace account access",
                deviceInfo: JSON.stringify(deviceInfo),
              },
            },
          });
          try {
            await logAuditEvent({
              action: AUDIT_LOG_ACTION.SESSION_REVOKED,
              entity: AUDIT_LOG_ENTITY.SESSION,
              entityId: session.id,
              description: `Session revoked due to missing access for user ID ${session.userId}`,
              metadata: { deviceInfo: JSON.stringify(deviceInfo) },
              user: { connect: { id: session.userId } },
            });
          } catch (error) {
            console.error(
              "Error logging audit event for missing access:",
              error
            );
          }
        } catch (error) {
          console.error("Error revoking session due to missing access:", error);
        }
        if (!isAuthRoute) {
          const redirect = NextResponse.redirect(
            new URL("/auth/login", request.url)
          );
          redirect.cookies.delete("session_token");
          return redirect;
        }
        response.cookies.delete("session_token");
        return response;
      }
      if (!ownWorkspaceAccount && sharedAccess?.suspendedAt) {
        try {
          const session = await prisma.session.update({
            where: { id: dbSession.id },
            data: {
              revokedAt: new Date(),
              ipAddress: deviceInfo.ipAddress,
              metadata: {
                revokedReason: "Shared workspace access suspended",
                deviceInfo: JSON.stringify(deviceInfo),
              },
            },
          });
          try {
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
              "Error logging audit event for suspended shared access:",
              error
            );
          }
        } catch (error) {
          console.error(
            "Error revoking session for suspended shared access:",
            error
          );
        }
        if (!isAuthRoute) {
          const redirect = NextResponse.redirect(
            new URL("/auth/login", request.url)
          );
          redirect.cookies.delete("session_token");
          return redirect;
        }
        response.cookies.delete("session_token");
        return response;
      }
      if (!ownWorkspaceAccount && sharedAccess!.expiresAt < new Date()) {
        try {
          const session = await prisma.session.update({
            where: { id: dbSession.id },
            data: {
              revokedAt: new Date(),
              ipAddress: deviceInfo.ipAddress,
              metadata: {
                revokedReason: "Shared workspace access expired",
                deviceInfo: JSON.stringify(deviceInfo),
              },
            },
          });
          try {
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
              "Error logging audit event for expired shared access:",
              error
            );
          }
        } catch (error) {
          console.error(
            "Error revoking session for expired shared access:",
            error
          );
        }
        if (!isAuthRoute) {
          const redirect = NextResponse.redirect(
            new URL("/auth/login", request.url)
          );
          redirect.cookies.delete("session_token");
          return redirect;
        }
        response.cookies.delete("session_token");
        return response;
      }
      if (!sharedAccess && ownWorkspaceAccount?.terminatedAt) {
        try {
          const session = await prisma.session.update({
            where: { id: dbSession.id },
            data: {
              revokedAt: new Date(),
              ipAddress: deviceInfo.ipAddress,
              metadata: {
                revokedReason: "Workspace account terminated",
                deviceInfo: JSON.stringify(deviceInfo),
              },
            },
          });
          try {
            await logAuditEvent({
              action: AUDIT_LOG_ACTION.SESSION_REVOKED,
              entity: AUDIT_LOG_ENTITY.SESSION,
              entityId: session.id,
              description: `Session revoked due to terminated workspace account for user ID ${session.userId}`,
              metadata: { deviceInfo: JSON.stringify(deviceInfo) },
              user: { connect: { id: session.userId } },
            });
          } catch (error) {
            console.error(
              "Error logging audit event for terminated workspace account:",
              error
            );
          }
        } catch (error) {
          console.error(
            "Error revoking session for terminated workspace account:",
            error
          );
        }
        if (!isAuthRoute) {
          const redirect = NextResponse.redirect(
            new URL("/auth/login", request.url)
          );
          redirect.cookies.delete("session_token");
          return redirect;
        }
        response.cookies.delete("session_token");
        return response;
      }
    } catch (error) {
      console.error("Error fetching shared access from database:", error);
      if (!isAuthRoute) {
        const redirect = NextResponse.redirect(
          new URL("/auth/login", request.url)
        );
        redirect.cookies.delete("session_token");
        return redirect;
      }
      response.cookies.delete("session_token");
      return response;
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
    haveSystemUsersAccess = systemAccess.usersAccessLevel.includes(
      USER_SYSTEM_ACCESS_LEVEL.VIEW
    );
    haveSystemWorkspacesAccess =
      systemAccess.workspaceAccountsAccessLevel.includes(
        WORKSPACE_ACCOUNT_SYSTEM_ACCESS_LEVEL.VIEW
      );
    haveSystemReportingAccess = systemAccess.reportingAccessLevel.includes(
      REPORTING_SYSTEM_ACCESS_LEVEL.VIEW
    );
    haveSystemReleasesAccess = systemAccess.releasesAccessLevel.includes(
      RELEASE_SYSTEM_ACCESS_LEVEL.VIEW
    );
    haveSystemTracksAccess = systemAccess.tracksAccessLevel.includes(
      TRACK_SYSTEM_ACCESS_LEVEL.VIEW
    );
    haveSystemVideosAccess = systemAccess.videosAccessLevel.includes(
      VIDEO_SYSTEM_ACCESS_LEVEL.VIEW
    );
    haveSystemRingtonesAccess = systemAccess.ringtonesAccessLevel.includes(
      RINGTONE_SYSTEM_ACCESS_LEVEL.VIEW
    );
    haveSystemArtistsAccess = systemAccess.artistsAccessLevel.includes(
      ARTIST_SYSTEM_ACCESS_LEVEL.VIEW
    );
    haveSystemPerformersAccess = systemAccess.performersAccessLevel.includes(
      PERFORMER_SYSTEM_ACCESS_LEVEL.VIEW
    );
    haveSystemProducersAndEngineersAccess =
      systemAccess.producersAndEngineersAccessLevel.includes(
        PRODUCER_AND_ENGINEER_SYSTEM_ACCESS_LEVEL.VIEW
      );
    haveSystemWritersAccess = systemAccess.writersAccessLevel.includes(
      WRITER_SYSTEM_ACCESS_LEVEL.VIEW
    );
    haveSystemPublishersAccess = systemAccess.publishersAccessLevel.includes(
      PUBLISHER_SYSTEM_ACCESS_LEVEL.VIEW
    );
    haveSystemLabelsAccess = systemAccess.labelsAccessLevel.includes(
      LABEL_SYSTEM_ACCESS_LEVEL.VIEW
    );
    haveSystemTransactionsAccess =
      systemAccess.transactionsAccessLevel.includes(
        TRANSACTION_SYSTEM_ACCESS_LEVEL.VIEW
      );
    haveSystemWithdrawsAccess = systemAccess.withdrawsAccessLevel.includes(
      WITHDRAW_SYSTEM_ACCESS_LEVEL.VIEW
    );
    haveSystemConsumptionAccess = systemAccess.consumptionAccessLevel.includes(
      CONSUMPTION_SYSTEM_ACCESS_LEVEL.VIEW
    );
    haveSystemEngagementAccess = systemAccess.engagementAccessLevel.includes(
      ENGAGEMENT_SYSTEM_ACCESS_LEVEL.VIEW
    );
    haveSystemRevenueAccess = systemAccess.revenueAccessLevel.includes(
      REVENUE_SYSTEM_ACCESS_LEVEL.VIEW
    );
    haveSystemGeoAccess = systemAccess.geoAccessLevel.includes(
      GEO_SYSTEM_ACCESS_LEVEL.VIEW
    );
    haveSystemRightsManagementAccess =
      systemAccess.rightsManagementAccessLevel.includes(
        RIGHTS_MANAGEMENT_SYSTEM_ACCESS_LEVEL.VIEW
      );
  }

  // Calculated composite permissions for system access
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

  // Shared access permissions
  let haveNormalWorkspacesAccess = role === systemOwner || role === systemAdmin;
  let haveNormalAccessesAccess = role === systemOwner || role === systemAdmin;
  let haveNormalReleasesAccess = role === systemOwner || role === systemAdmin;
  let haveNormalTracksAccess = role === systemOwner || role === systemAdmin;
  let haveNormalVideosAccess = role === systemOwner || role === systemAdmin;
  let haveNormalRingtonesAccess = role === systemOwner || role === systemAdmin;
  let haveNormalArtistsAccess = role === systemOwner || role === systemAdmin;
  let haveNormalPerformersAccess = role === systemOwner || role === systemAdmin;
  let haveNormalProducersAndEngineersAccess =
    role === systemOwner || role === systemAdmin;
  let haveNormalWritersAccess = role === systemOwner || role === systemAdmin;
  let haveNormalPublishersAccess = role === systemOwner || role === systemAdmin;
  let haveNormalLabelsAccess = role === systemOwner || role === systemAdmin;
  let haveNormalTransactionsAccess =
    role === systemOwner || role === systemAdmin;
  let haveNormalWithdrawsAccess = role === systemOwner || role === systemAdmin;
  let haveNormalConsumptionAccess =
    role === systemOwner || role === systemAdmin;
  let haveNormalEngagementAccess = role === systemOwner || role === systemAdmin;
  let haveNormalRevenueAccess = role === systemOwner || role === systemAdmin;
  let haveNormalGeoAccess = role === systemOwner || role === systemAdmin;

  // Override permissions for normalUser based on their workspace account access
  if (role === normalUser) {
    if (ownWorkspaceAccount) {
      haveNormalWorkspacesAccess = true;
      haveNormalAccessesAccess = true;
      haveNormalReleasesAccess = true;
      haveNormalTracksAccess = true;
      haveNormalVideosAccess = true;
      haveNormalRingtonesAccess = true;
      haveNormalArtistsAccess = true;
      haveNormalPerformersAccess = true;
      haveNormalProducersAndEngineersAccess = true;
      haveNormalWritersAccess = true;
      haveNormalPublishersAccess = true;
      haveNormalLabelsAccess = true;
      haveNormalTransactionsAccess = true;
      haveNormalWithdrawsAccess = true;
      haveNormalConsumptionAccess = true;
      haveNormalEngagementAccess = true;
      haveNormalRevenueAccess = true;
      haveNormalGeoAccess = true;
    }
    if (sharedAccess) {
      haveNormalWorkspacesAccess = isSharedAccessAdmin;
      haveNormalAccessesAccess = isSharedAccessAdmin;
      haveNormalReleasesAccess =
        isSharedAccessAdmin || sharedAccess.releaseAccessLevel.length !== 0;
      haveNormalTracksAccess =
        isSharedAccessAdmin || sharedAccess.trackAccessLevel.length !== 0;
      haveNormalVideosAccess =
        isSharedAccessAdmin || sharedAccess.videoAccessLevel.length !== 0;
      haveNormalRingtonesAccess =
        isSharedAccessAdmin || sharedAccess.ringtoneAccessLevel.length !== 0;
      haveNormalArtistsAccess =
        isSharedAccessAdmin || sharedAccess.artistAccessLevel.length !== 0;
      haveNormalPerformersAccess =
        isSharedAccessAdmin || sharedAccess.performerAccessLevel.length !== 0;
      haveNormalProducersAndEngineersAccess =
        isSharedAccessAdmin ||
        sharedAccess.producerAndEngineerAccessLevel.length !== 0;
      haveNormalWritersAccess =
        isSharedAccessAdmin || sharedAccess.writerAccessLevel.length !== 0;
      haveNormalPublishersAccess =
        isSharedAccessAdmin || sharedAccess.publisherAccessLevel.length !== 0;
      haveNormalLabelsAccess =
        isSharedAccessAdmin || sharedAccess.labelAccessLevel.length !== 0;
      haveNormalTransactionsAccess =
        isSharedAccessAdmin || sharedAccess.transactionAccessLevel.length !== 0;
      haveNormalWithdrawsAccess =
        isSharedAccessAdmin || sharedAccess.withdrawsAccessLevel.length !== 0;
      haveNormalConsumptionAccess =
        isSharedAccessAdmin || sharedAccess.consumptionAccessLevel.length !== 0;
      haveNormalEngagementAccess =
        isSharedAccessAdmin || sharedAccess.engagementAccessLevel.length !== 0;
      haveNormalRevenueAccess =
        isSharedAccessAdmin || sharedAccess.revenueAccessLevel.length !== 0;
      haveNormalGeoAccess =
        isSharedAccessAdmin || sharedAccess.geoAccessLevel.length !== 0;
    }
  }

  // Calculated composite permissions for normal access
  const haveNormalAdministrationAccess =
    haveNormalWorkspacesAccess || haveNormalAccessesAccess;
  const haveNormalAssetsAccess =
    haveNormalReleasesAccess ||
    haveNormalTracksAccess ||
    haveNormalVideosAccess ||
    haveNormalRingtonesAccess;
  const haveNormalContributorsAccess =
    haveNormalArtistsAccess ||
    haveNormalPerformersAccess ||
    haveNormalProducersAndEngineersAccess ||
    haveNormalWritersAccess ||
    haveNormalPublishersAccess ||
    haveNormalLabelsAccess;
  const haveNormalCatalogAccess =
    haveNormalAssetsAccess || haveNormalContributorsAccess;
  const haveNormalRoyaltiesAccess =
    haveNormalTransactionsAccess || haveNormalWithdrawsAccess;
  const haveNormalAnalyticsAccess =
    haveNormalConsumptionAccess ||
    haveNormalEngagementAccess ||
    haveNormalRevenueAccess ||
    haveNormalGeoAccess;
  const haveNormalReportsAccess = haveNormalAnalyticsAccess;

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

  // Normal access check
  if (isNormalRoute && !haveNormalAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    if (!isAuthRoute) {
      const redirect = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      redirect.cookies.delete("session_token");
      return redirect;
    }
    response.cookies.delete("session_token");
    return response;
  }

  // Normal adminstration access
  if (isNormalAdministrationRoute && !haveNormalAdministrationAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal workspaces access
  if (isNormalWorkspacesRoute && !haveNormalWorkspacesAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal accesses access
  if (isNormalAccessesRoute && !haveNormalAccessesAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal catalog access
  if (isNormalCatalogRoute && !haveNormalCatalogAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal assets access
  if (isNormalAssetsRoute && !haveNormalAssetsAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal releases access
  if (isNormalReleasesRoute && !haveNormalReleasesAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal tracks access
  if (isNormalTracksRoute && !haveNormalTracksAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal videos access
  if (isNormalVideosRoute && !haveNormalVideosAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal ringtones access
  if (isNormalRingtonesRoute && !haveNormalRingtonesAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal contributors access
  if (isNormalContributorsRoute && !haveNormalContributorsAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal artists access
  if (isNormalArtistsRoute && !haveNormalArtistsAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal performers access
  if (isNormalPerformersRoute && !haveNormalPerformersAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal producers and engineers access
  if (
    isNormalProducersAndEngineersRoute &&
    !haveNormalProducersAndEngineersAccess
  ) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal writers access
  if (isNormalWritersRoute && !haveNormalWritersAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal publishers access
  if (isNormalPublishersRoute && !haveNormalPublishersAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal labels access
  if (isNormalLabelsRoute && !haveNormalLabelsAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal royalties access
  if (isNormalRoyaltiesRoute && !haveNormalRoyaltiesAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal transactions access
  if (isNormalTransactionsRoute && !haveNormalTransactionsAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal withdraws access
  if (isNormalWithdrawsRoute && !haveNormalWithdrawsAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal reports access
  if (isNormalReportsRoute && !haveNormalReportsAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal analytics access
  if (isNormalAnalyticsRoute && !haveNormalAnalyticsAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal consumption access
  if (isNormalConsumptionRoute && !haveNormalConsumptionAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal engagement access
  if (isNormalEngagementRoute && !haveNormalEngagementAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal revenue access
  if (isNormalRevenueRoute && !haveNormalRevenueAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Normal geo access
  if (isNormalGeoRoute && !haveNormalGeoAccess) {
    if (role === systemUser) {
      return NextResponse.redirect(new URL("/system", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Exclude API routes, static files, image optimizations, image files (.png, .jpeg, .gif, .jpg, .webp), sw.js, manifest.json, and favicon.ico
    "/((?!api|_next/static|_next/image|icons|sw\\.js|manifest\\.webmanifest|offline|favicon\\.ico|.*\\.(?:png|jpeg|gif|jpg|webp)$).*)",
  ],
};
