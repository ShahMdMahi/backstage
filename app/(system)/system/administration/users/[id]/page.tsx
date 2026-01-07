import { getUserById } from "@/actions/system/user";
import { DeleteUserButton } from "@/components/system/administration/users/delete-user-button";
import { RevokeSessionButton } from "@/components/system/administration/users/revoke-session-button";
import { AuditLogsTabs } from "@/components/system/administration/users/audit-logs-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getInitials } from "@/lib/utils";
import { formatInTimeZone } from "date-fns-tz";
import { DeviceInfo } from "@/lib/device-info";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  BuildingIcon,
  MonitorIcon,
  ScrollTextIcon,
  ScaleIcon,
  PenIcon,
  HashIcon,
  CalendarIcon,
  UsersIcon,
  KeyIcon,
  MapPinIcon,
  GlobeIcon,
} from "lucide-react";
import { getCurrentSession } from "@/actions/shared/session";
import { redirect } from "next/navigation";
import {
  RIGHTS_MANAGEMENT_SYSTEM_ACCESS_LEVEL,
  ROLE,
  USER_SYSTEM_ACCESS_LEVEL,
  WORKSPACE_ACCOUNT_SYSTEM_ACCESS_LEVEL,
} from "@/lib/prisma/enums";
import { logout } from "@/actions/auth/auth";

export const dynamic = "force-dynamic";

// Helper to format role display
function formatRole(role: string): string {
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

// Format date in Bangladesh timezone
function formatDateTime(date: Date | null | undefined): {
  date: string;
  time: string;
} {
  if (!date) return { date: "N/A", time: "" };
  const dateStr = formatInTimeZone(date, "Asia/Dhaka", "dd/MM/yyyy");
  const timeStr = formatInTimeZone(date, "Asia/Dhaka", "hh:mm:ss a");
  return { date: dateStr, time: timeStr };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserViewPage({ params }: PageProps) {
  const id = (await params).id;
  const session = await getCurrentSession();
  if (!session.success) redirect("/auth/login");
  if (!session?.data?.user) redirect("/auth/login");
  if (
    session?.data?.user?.role !== ROLE.SYSTEM_OWNER &&
    session?.data?.user?.role !== ROLE.SYSTEM_ADMIN
  ) {
    if (session?.data?.user?.role === ROLE.SYSTEM_USER) {
      if (!session?.data?.user?.systemAccess) {
        const result = await logout();
        if (result.success) {
          redirect("/auth/login");
        } else {
          redirect("/auth/login");
        }
      }
      if (
        !session?.data?.user?.systemAccess?.usersAccessLevel.includes(
          USER_SYSTEM_ACCESS_LEVEL.VIEW
        )
      ) {
        redirect("/system");
      }
    } else {
      redirect("/");
    }
  }

  const haveSystemAccessViewAccess =
    session?.data?.user?.role === ROLE.SYSTEM_OWNER ||
    session?.data?.user?.role === ROLE.SYSTEM_ADMIN;
  const haveAssignedSystemAccessViewAccess =
    session?.data?.user?.role === ROLE.SYSTEM_OWNER ||
    session?.data?.user?.role === ROLE.SYSTEM_ADMIN;
  const haveWorkspaceAccountsViewAccess =
    session?.data?.user?.role === ROLE.SYSTEM_OWNER ||
    session?.data?.user?.role === ROLE.SYSTEM_ADMIN ||
    session?.data?.user?.systemAccess?.workspaceAccountsAccessLevel.includes(
      WORKSPACE_ACCOUNT_SYSTEM_ACCESS_LEVEL.VIEW
    );
  const haveAssignedWorkspaceAccountAccessViewAccess =
    haveWorkspaceAccountsViewAccess;
  const haveSharedWorkspaceAccountAccessViewAccess =
    haveWorkspaceAccountsViewAccess;
  const haveRightsManagementViewAccess =
    session?.data?.user?.role === ROLE.SYSTEM_OWNER ||
    session?.data?.user?.role === ROLE.SYSTEM_ADMIN ||
    session?.data?.user?.systemAccess?.rightsManagementAccessLevel.includes(
      RIGHTS_MANAGEMENT_SYSTEM_ACCESS_LEVEL.VIEW
    );

  const userResult = await getUserById(id);

  if (!userResult.success || !userResult.data) {
    return (
      <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
        <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <UserIcon className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                User Details
              </h1>
              <p className="text-muted-foreground mt-1">
                View user information
              </p>
            </div>
          </div>
          <Alert variant="destructive">
            <AlertCircleIcon className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {userResult.message || "Failed to load user details."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const user = userResult.data;

  // Check if user can be edited
  const canEdit = (() => {
    if (session.data.user.id === user.id) return false;
    if (session.data.user.role === ROLE.SYSTEM_OWNER) return true;
    if (session.data.user.role === ROLE.SYSTEM_ADMIN) {
      return user.role !== ROLE.SYSTEM_OWNER && user.role !== ROLE.SYSTEM_ADMIN;
    }
    if (session.data.user.role === ROLE.SYSTEM_USER) {
      return (
        user.role === ROLE.USER &&
        session.data.user.systemAccess?.usersAccessLevel.includes(
          USER_SYSTEM_ACCESS_LEVEL.UPDATE
        )
      );
    }
    return false;
  })();

  // Check if user can be deleted
  const canDelete =
    user.role === ROLE.USER &&
    !user.systemAccess &&
    !user.ownWorkspaceAccount &&
    !user.sharedWorkspaceAccountAccess &&
    session.data.user.id !== user.id &&
    (session.data.user.role === ROLE.SYSTEM_OWNER ||
      session.data.user.role === ROLE.SYSTEM_ADMIN ||
      (session.data.user.role === ROLE.SYSTEM_USER &&
        session.data.user.systemAccess?.usersAccessLevel.includes(
          USER_SYSTEM_ACCESS_LEVEL.DELETE
        )));

  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <UserIcon className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                User Details
              </h1>
              <p className="text-muted-foreground mt-1">
                View detailed information about this user
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {canEdit && (
              <Button asChild>
                <Link href={`/system/administration/users/${user.id}/edit`}>
                  <PenIcon className="mr-2 size-4" />
                  Edit
                </Link>
              </Button>
            )}
            {canDelete && (
              <DeleteUserButton userId={user.id} userName={user.name} />
            )}
          </div>
        </div>

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="size-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Basic user details and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <Avatar className="size-32 border-4 border-muted">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="text-3xl border-2 border-dashed border-muted-foreground/50">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <Badge
                  variant={
                    user.role === ROLE.SYSTEM_OWNER
                      ? "destructive"
                      : user.role === ROLE.SYSTEM_ADMIN
                        ? "default"
                        : user.role === ROLE.SYSTEM_USER
                          ? "secondary"
                          : "outline"
                  }
                  className="text-sm"
                >
                  {formatRole(user.role)}
                </Badge>
              </div>

              {/* User Details */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <HashIcon className="size-3" /> User ID
                  </p>
                  <p className="font-mono text-sm">{user.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <UserIcon className="size-3" /> Name
                  </p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MailIcon className="size-3" /> Email
                  </p>
                  <p>{user.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <PhoneIcon className="size-3" /> Phone
                  </p>
                  <p>{user.phone || "N/A"}</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Status & Timestamps */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="size-3" /> Registered
                </p>
                <div>
                  <p className="text-sm">
                    {formatDateTime(user.createdAt).date}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(user.createdAt).time}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckCircleIcon className="size-3" /> Verified
                </p>
                {user.verifiedAt ? (
                  <div>
                    <p className="text-sm">
                      {formatDateTime(user.verifiedAt).date}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(user.verifiedAt).time}
                    </p>
                  </div>
                ) : (
                  <Badge variant="secondary">Not Verified</Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckCircleIcon className="size-3" /> Approved
                </p>
                {user.approvedAt ? (
                  <div>
                    <p className="text-sm">
                      {formatDateTime(user.approvedAt).date}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(user.approvedAt).time}
                    </p>
                  </div>
                ) : (
                  <Badge variant="secondary">Not Approved</Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <XCircleIcon className="size-3" /> Suspended
                </p>
                {user.suspendedAt ? (
                  <div>
                    <Badge variant="destructive" className="mb-1">
                      {formatDateTime(user.suspendedAt).date}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(user.suspendedAt).time}
                    </p>
                  </div>
                ) : (
                  <Badge variant="default">Active</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Access */}
        {haveSystemAccessViewAccess && user.systemAccess && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon className="size-5" />
                System Access
              </CardTitle>
              <CardDescription>
                User&apos;s system access permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Access ID</p>
                  <p className="font-mono text-sm">{user.systemAccess.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Expires At</p>
                  <div>
                    <p className="text-sm">
                      {formatDateTime(user.systemAccess.expiresAt).date}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(user.systemAccess.expiresAt).time}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  {user.systemAccess.suspendedAt ? (
                    <Badge variant="destructive">Suspended</Badge>
                  ) : (
                    <Badge variant="default">Active</Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Users Access</p>
                  <div className="flex flex-wrap gap-1">
                    {user.systemAccess.usersAccessLevel.length > 0 ? (
                      user.systemAccess.usersAccessLevel.map((level) => (
                        <Badge
                          key={level}
                          variant="outline"
                          className="text-xs"
                        >
                          {level}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        None
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/system/administration/accesses/${user.systemAccess.id}`}
                  >
                    View Full Access Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned System Accesses */}
        {haveAssignedSystemAccessViewAccess &&
          user.assignedSystemAccesses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyIcon className="size-5" />
                  Assigned System Accesses
                </CardTitle>
                <CardDescription>
                  System accesses assigned by this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.assignedSystemAccesses.map((access) => (
                    <div
                      key={access.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-mono text-sm">{access.id}</p>
                        <p className="text-xs text-muted-foreground">
                          User: {access.userId}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/system/administration/accesses/${access.id}`}
                        >
                          View
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Own Workspace Account */}
        {haveWorkspaceAccountsViewAccess && user.ownWorkspaceAccount && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BuildingIcon className="size-5" />
                Owned Workspace Account
              </CardTitle>
              <CardDescription>
                Workspace account owned by this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Workspace ID</p>
                  <p className="font-mono text-sm">
                    {user.ownWorkspaceAccount.id}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="outline">
                    {user.ownWorkspaceAccount.type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned Shared Workspace Accesses */}
        {haveAssignedWorkspaceAccountAccessViewAccess &&
          user.assignedWorkspaceAccountAccesses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyIcon className="size-5" />
                  Assigned Workspace Accesses
                </CardTitle>
                <CardDescription>
                  Workspace accesses assigned by this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.assignedWorkspaceAccountAccesses.map((access) => (
                    <div
                      key={access.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-mono text-sm">{access.id}</p>
                        <p className="text-xs text-muted-foreground">
                          User: {access.userId} | Workspace:{" "}
                          {access.workspaceAccountId}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Shared Workspace Account Access */}
        {haveSharedWorkspaceAccountAccessViewAccess &&
          user.sharedWorkspaceAccountAccess && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="size-5" />
                  Shared Workspace Access
                </CardTitle>
                <CardDescription>
                  Shared workspace account access for this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Access ID</p>
                    <p className="font-mono text-sm">
                      {user.sharedWorkspaceAccountAccess.id}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Workspace</p>
                    <p className="font-mono text-sm">
                      {user.sharedWorkspaceAccountAccess.workspaceAccountId}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Rights Management */}
        {haveRightsManagementViewAccess &&
          user.rightsManagements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScaleIcon className="size-5" />
                  Rights Management ({user.rightsManagements.length})
                </CardTitle>
                <CardDescription>
                  Rights management entries for this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {user.rightsManagements.map((rm) => (
                    <div
                      key={rm.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-mono text-sm">{rm.id}</p>
                        <p className="text-xs text-muted-foreground">
                          Status: {rm.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Sessions */}
        {user.sessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MonitorIcon className="size-5" />
                Sessions ({user.sessions.length})
              </CardTitle>
              <CardDescription>Active and past login sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {user.sessions.map((sessionItem) => {
                  const metadata = sessionItem.metadata as {
                    deviceInfo: string & Record<string, unknown>;
                    revokedReason?: string;
                  };
                  const deviceInfo = metadata?.deviceInfo
                    ? (JSON.parse(metadata.deviceInfo) as DeviceInfo)
                    : null;
                  const isActive =
                    !sessionItem.revokedAt &&
                    sessionItem.expiresAt > new Date();
                  const isExpired =
                    !sessionItem.revokedAt &&
                    sessionItem.expiresAt < new Date();

                  return (
                    <div
                      key={sessionItem.id}
                      className="flex flex-col gap-3 p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">
                              {deviceInfo?.deviceName ||
                                sessionItem.deviceType ||
                                "Unknown Device"}
                            </p>
                            {isActive && (
                              <Badge variant="default" className="text-xs">
                                Active
                              </Badge>
                            )}
                            {isExpired && (
                              <Badge variant="destructive" className="text-xs">
                                Expired
                              </Badge>
                            )}
                            {sessionItem.revokedAt && (
                              <Badge variant="outline" className="text-xs">
                                Revoked
                              </Badge>
                            )}
                          </div>
                          {deviceInfo && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {deviceInfo.deviceBrand || "Unknown Brand"}{" "}
                              {deviceInfo.deviceModel || "Unknown Model"}
                            </p>
                          )}
                        </div>
                        {isActive && (
                          <RevokeSessionButton
                            sessionId={sessionItem.id}
                            deviceName={
                              deviceInfo?.deviceName ||
                              sessionItem.deviceType ||
                              "Unknown Device"
                            }
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {sessionItem.ipAddress && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <GlobeIcon className="size-3" />
                            <span>{sessionItem.ipAddress}</span>
                          </div>
                        )}
                        {deviceInfo?.location && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPinIcon className="size-3" />
                            <span>
                              {deviceInfo.location.city || "Unknown"},{" "}
                              {deviceInfo.location.region || "Unknown"},{" "}
                              {deviceInfo.location.country || "Unknown"}
                            </span>
                          </div>
                        )}
                      </div>

                      {deviceInfo?.location?.isp && (
                        <p className="text-xs text-muted-foreground">
                          ISP: {deviceInfo.location.isp}
                        </p>
                      )}

                      {sessionItem.deviceFingerprint && (
                        <p className="text-xs text-muted-foreground truncate">
                          Fingerprint: {sessionItem.deviceFingerprint}
                        </p>
                      )}

                      {metadata?.revokedReason && (
                        <p className="text-xs text-muted-foreground">
                          Revoked Reason: {metadata.revokedReason}
                        </p>
                      )}

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <p>
                          Created: {formatDateTime(sessionItem.createdAt).date}{" "}
                          {formatDateTime(sessionItem.createdAt).time}
                        </p>
                        {sessionItem.accessedAt && (
                          <p>
                            Last Accessed:{" "}
                            {formatDateTime(sessionItem.accessedAt).date}{" "}
                            {formatDateTime(sessionItem.accessedAt).time}
                          </p>
                        )}
                        <p>
                          {isExpired ? "Expired" : "Expires"}:{" "}
                          {formatDateTime(sessionItem.expiresAt).date}{" "}
                          {formatDateTime(sessionItem.expiresAt).time}
                        </p>
                        {sessionItem.revokedAt && (
                          <p>
                            Revoked:{" "}
                            {formatDateTime(sessionItem.revokedAt).date}{" "}
                            {formatDateTime(sessionItem.revokedAt).time}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audit Logs */}
        {user.auditLogs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollTextIcon className="size-5" />
                Audit Logs ({user.auditLogs.length})
              </CardTitle>
              <CardDescription>
                Filter and view activity logs by entity type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditLogsTabs auditLogs={user.auditLogs} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
