import { getSystemAccessById } from "@/actions/system/access";
import { DeleteAccessButton } from "@/components/system/administration/accesses/delete-access-button";
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
import { getInitials, cn } from "@/lib/utils";
import { formatInTimeZone } from "date-fns-tz";
import {
  ShieldCheckIcon,
  UserIcon,
  UserCogIcon,
  HashIcon,
  MailIcon,
  PhoneIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  BuildingIcon,
  FileTextIcon,
  DiscIcon,
  MusicIcon,
  VideoIcon,
  BellIcon,
  MicIcon,
  HeadphonesIcon,
  WrenchIcon,
  PenToolIcon,
  BookOpenIcon,
  TagIcon,
  CreditCardIcon,
  WalletIcon,
  BarChart3Icon,
  TrendingUpIcon,
  DollarSignIcon,
  GlobeIcon,
  ScaleIcon,
  PenIcon,
} from "lucide-react";
import { getCurrentSession } from "@/actions/shared/session";
import { redirect } from "next/navigation";
import { ROLE } from "@/lib/prisma/enums";
import { logout } from "@/actions/auth/auth";

export const dynamic = "force-dynamic";

// Helper to format role display
function formatRole(role: string): string {
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

// Access categories with their icons and labels
const accessCategoriesConfig = [
  {
    key: "usersAccessLevel",
    name: "User Access",
    icon: UsersIcon,
    description: "Manage user accounts",
  },
  {
    key: "workspaceAccountsAccessLevel",
    name: "Workspace Access",
    icon: BuildingIcon,
    description: "Manage workspace accounts",
  },
  {
    key: "reportingAccessLevel",
    name: "Reporting Access",
    icon: FileTextIcon,
    description: "Access to reports",
  },
  {
    key: "releasesAccessLevel",
    name: "Release Access",
    icon: DiscIcon,
    description: "Manage music releases",
  },
  {
    key: "tracksAccessLevel",
    name: "Track Access",
    icon: MusicIcon,
    description: "Manage individual tracks",
  },
  {
    key: "videosAccessLevel",
    name: "Video Access",
    icon: VideoIcon,
    description: "Manage video content",
  },
  {
    key: "ringtonesAccessLevel",
    name: "Ringtone Access",
    icon: BellIcon,
    description: "Manage ringtones",
  },
  {
    key: "artistsAccessLevel",
    name: "Artist Access",
    icon: MicIcon,
    description: "Manage artists",
  },
  {
    key: "performersAccessLevel",
    name: "Performer Access",
    icon: HeadphonesIcon,
    description: "Manage performers",
  },
  {
    key: "producersAndEngineersAccessLevel",
    name: "Producer & Engineer Access",
    icon: WrenchIcon,
    description: "Manage producers and engineers",
  },
  {
    key: "writersAccessLevel",
    name: "Writer Access",
    icon: PenToolIcon,
    description: "Manage writers",
  },
  {
    key: "publishersAccessLevel",
    name: "Publisher Access",
    icon: BookOpenIcon,
    description: "Manage publishers",
  },
  {
    key: "labelsAccessLevel",
    name: "Label Access",
    icon: TagIcon,
    description: "Manage record labels",
  },
  {
    key: "transactionsAccessLevel",
    name: "Transaction Access",
    icon: CreditCardIcon,
    description: "View and manage transactions",
  },
  {
    key: "withdrawsAccessLevel",
    name: "Withdraw Access",
    icon: WalletIcon,
    description: "Manage withdrawals",
  },
  {
    key: "consumptionAccessLevel",
    name: "Consumption Access",
    icon: BarChart3Icon,
    description: "View consumption data",
  },
  {
    key: "engagementAccessLevel",
    name: "Engagement Access",
    icon: TrendingUpIcon,
    description: "View engagement metrics",
  },
  {
    key: "revenueAccessLevel",
    name: "Revenue Access",
    icon: DollarSignIcon,
    description: "View revenue data",
  },
  {
    key: "geoAccessLevel",
    name: "Geo Access",
    icon: GlobeIcon,
    description: "View geographic data",
  },
  {
    key: "rightsManagementAccessLevel",
    name: "Rights Management Access",
    icon: ScaleIcon,
    description: "Manage rights",
  },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AccessPage({ params }: PageProps) {
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
      redirect("/system");
    } else {
      redirect("/");
    }
  }

  const systemAccess = await getSystemAccessById(id);

  // Show custom not found message
  if (!systemAccess.success || !systemAccess.data) {
    return (
      <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
        <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
          {/* Page Header */}
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheckIcon className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                Access Details
              </h1>
              <p className="text-muted-foreground mt-1">
                View system access permissions and details
              </p>
            </div>
          </div>

          {/* Not Found Card */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <XCircleIcon className="size-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                Access Not Found
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-1">
                The system access you are looking for does not exist or has been
                removed.
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                ID: {id}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const access = systemAccess.data;
  const user = access.user;
  const assigner = access.assigner;
  const userInitials = getInitials(user.name);
  const assignerInitials = getInitials(assigner.name);

  // Check if access is expired
  const isExpired = new Date(access.expiresAt) < new Date();
  // Check if access is suspended
  const isSuspended = !!access.suspendedAt;

  // Get access status
  const getAccessStatus = () => {
    if (isSuspended)
      return {
        label: "Suspended",
        variant: "destructive" as const,
        icon: XCircleIcon,
      };
    if (isExpired)
      return {
        label: "Expired",
        variant: "secondary" as const,
        icon: AlertTriangleIcon,
      };
    return {
      label: "Active",
      variant: "default" as const,
      icon: CheckCircleIcon,
    };
  };

  const status = getAccessStatus();
  const StatusIcon = status.icon;

  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheckIcon className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Access Details
              </h1>
              <Badge variant={status.variant} className="gap-1">
                <StatusIcon className="size-3" />
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              View system access permissions and details
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="gap-1.5">
              <Link href={`/system/administration/accesses/${access.id}/edit`}>
                <PenIcon className="size-4" />
                Edit Access
              </Link>
            </Button>
            <DeleteAccessButton accessId={access.id} userName={user.name} />
          </div>
        </div>

        {/* Status Alerts */}
        {isSuspended && (
          <Alert variant="destructive">
            <AlertTriangleIcon className="size-4" />
            <AlertTitle>Access Suspended</AlertTitle>
            <AlertDescription>
              This system access was suspended on{" "}
              {formatInTimeZone(
                access.suspendedAt!,
                "Asia/Dhaka",
                "dd/MM/yyyy"
              )}{" "}
              at{" "}
              {formatInTimeZone(
                access.suspendedAt!,
                "Asia/Dhaka",
                "hh:mm:ss a"
              )}
            </AlertDescription>
          </Alert>
        )}

        {isExpired && !isSuspended && (
          <Alert>
            <AlertTriangleIcon className="size-4" />
            <AlertTitle>Access Expired</AlertTitle>
            <AlertDescription>
              This system access expired on{" "}
              {formatInTimeZone(access.expiresAt, "Asia/Dhaka", "dd/MM/yyyy")}{" "}
              at{" "}
              {formatInTimeZone(access.expiresAt, "Asia/Dhaka", "hh:mm:ss a")}
            </AlertDescription>
          </Alert>
        )}

        {/* Access Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HashIcon className="size-5" />
              Access Information
            </CardTitle>
            <CardDescription>
              General information about this system access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Access ID
                </label>
                <p className="font-mono text-sm break-all">{access.id}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Created At
                </label>
                <div>
                  <p className="font-medium">
                    {formatInTimeZone(
                      access.createdAt,
                      "Asia/Dhaka",
                      "dd/MM/yyyy"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatInTimeZone(
                      access.createdAt,
                      "Asia/Dhaka",
                      "hh:mm:ss a"
                    )}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Updated At
                </label>
                <div>
                  <p className="font-medium">
                    {formatInTimeZone(
                      access.updatedAt,
                      "Asia/Dhaka",
                      "dd/MM/yyyy"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatInTimeZone(
                      access.updatedAt,
                      "Asia/Dhaka",
                      "hh:mm:ss a"
                    )}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Expires At
                </label>
                <div>
                  <p
                    className={cn(
                      "font-medium",
                      isExpired && "text-destructive"
                    )}
                  >
                    {formatInTimeZone(
                      access.expiresAt,
                      "Asia/Dhaka",
                      "dd/MM/yyyy"
                    )}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      isExpired
                        ? "text-destructive/80"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatInTimeZone(
                      access.expiresAt,
                      "Asia/Dhaka",
                      "hh:mm:ss a"
                    )}
                  </p>
                </div>
              </div>
              {access.suspendedAt && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Suspended At
                  </label>
                  <div>
                    <p className="font-medium text-destructive">
                      {formatInTimeZone(
                        access.suspendedAt,
                        "Asia/Dhaka",
                        "dd/MM/yyyy"
                      )}
                    </p>
                    <p className="text-xs text-destructive/80">
                      {formatInTimeZone(
                        access.suspendedAt,
                        "Asia/Dhaka",
                        "hh:mm:ss a"
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User and Assigner Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* User Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="size-5" />
                Assigned User
              </CardTitle>
              <CardDescription>
                The user who has been granted this access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="size-16 border-2 border-border">
                  <AvatarImage src={user.avatar || undefined} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {formatRole(user.role)}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HashIcon className="size-3.5" />
                      <span className="font-mono text-xs break-all">
                        {user.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MailIcon className="size-3.5 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <PhoneIcon className="size-3.5 text-muted-foreground" />
                      <span>{user.phone || "No phone number"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigner Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCogIcon className="size-5" />
                Assigned By
              </CardTitle>
              <CardDescription>
                The administrator who granted this access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="size-16 border-2 border-border">
                  <AvatarImage
                    src={assigner.avatar || undefined}
                    alt={assigner.name}
                  />
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                    {assignerInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-lg font-semibold">{assigner.name}</h3>
                    <Badge
                      variant={
                        assigner.role === "SYSTEM_OWNER"
                          ? "destructive"
                          : "default"
                      }
                      className="mt-1"
                    >
                      {formatRole(assigner.role)}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HashIcon className="size-3.5" />
                      <span className="font-mono text-xs break-all">
                        {assigner.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MailIcon className="size-3.5 text-muted-foreground" />
                      <span>{assigner.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <PhoneIcon className="size-3.5 text-muted-foreground" />
                      <span>{assigner.phone || "No phone number"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheckIcon className="size-5" />
              Access Permissions
            </CardTitle>
            <CardDescription>
              Detailed breakdown of all granted permissions by category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {accessCategoriesConfig.map((category) => {
              const permissions =
                (access[category.key as keyof typeof access] as string[]) || [];
              const Icon = category.icon;
              const hasPermissions = permissions.length > 0;

              return (
                <div
                  key={category.key}
                  className={cn(
                    "rounded-lg border p-4 transition-colors",
                    hasPermissions
                      ? "bg-card hover:bg-accent/5"
                      : "bg-muted/30 opacity-60"
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="flex items-center gap-3 sm:min-w-[220px]">
                      <div
                        className={cn(
                          "flex size-9 items-center justify-center rounded-lg",
                          hasPermissions
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{category.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      {hasPermissions ? (
                        permissions.map((perm) => (
                          <Badge
                            key={perm}
                            variant="secondary"
                            className="capitalize"
                          >
                            {perm.toLowerCase().replace(/_/g, " ")}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          No permissions granted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3Icon className="size-5" />
              Permissions Summary
            </CardTitle>
            <CardDescription>
              Quick overview of granted permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {(() => {
                let totalCategories = 0;
                let totalPermissions = 0;
                let categoriesWithAccess = 0;

                accessCategoriesConfig.forEach((category) => {
                  const permissions =
                    (access[category.key as keyof typeof access] as string[]) ||
                    [];
                  totalCategories++;
                  totalPermissions += permissions.length;
                  if (permissions.length > 0) categoriesWithAccess++;
                });

                return (
                  <>
                    <div className="rounded-lg border bg-card p-4 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {categoriesWithAccess}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Categories with Access
                      </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {totalCategories - categoriesWithAccess}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Categories Denied
                      </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {totalPermissions}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total Permissions
                      </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {totalCategories}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total Categories
                      </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {Math.round(
                          (categoriesWithAccess / totalCategories) * 100
                        )}
                        %
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Access Coverage
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
