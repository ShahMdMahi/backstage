import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheckIcon, UserIcon, CalendarIcon } from "lucide-react";

// Permission counts matching the actual form structure
const permissionRowsConfig = [
  7, // User Access
  8, // Workspace Access
  4, // Reporting Access
  7, // Release Access
  5, // Track Access
  7, // Video Access
  7, // Ringtone Access
  7, // Artist Access
  5, // Performer Access
  5, // Pro & Eng Access
  5, // Writer Access
  7, // Publisher Access
  7, // Label Access
  7, // Transaction Access
  6, // Withdrawl Access
  1, // Consumption Access
  1, // Engagement Access
  1, // Revenue Access
  1, // Geo Access
  7, // Rights Mng Access
];

export default function Loading() {
  return (
    <div className="w-full max-w-none px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        {/* Page Header - Show actual content for better UX */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheckIcon className="size-5 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              System Access Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure system user access permissions for system resources
            </p>
          </div>
        </div>

        {/* User Selection Card Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <UserIcon className="size-5 text-muted-foreground" />
              <span className="font-semibold">Select System User</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose the system user to assign access permissions
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-12 w-full" />
            </div>
            {/* Selected user preview skeleton */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1.5">
                  <Skeleton className="size-14 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access Expiry Card Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-5 text-muted-foreground" />
              <span className="font-semibold">Access Expiry</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Set the expiration date for this access. The access will
              automatically be revoked after this date.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-20" />
                <span className="text-destructive">*</span>
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-64" />
            </div>
          </CardContent>
        </Card>

        {/* Access Permissions Card Skeleton */}
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-5 text-muted-foreground" />
              <span className="font-semibold">Access Permissions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure granular access controls for different system resources.
              Permissions are cascading - enable previous permissions to unlock
              the next ones. Click Admin to toggle all.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Permission rows skeleton - matching actual structure */}
            {permissionRowsConfig.map((permCount, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-3 animate-pulse"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="md:min-w-[180px] md:max-w-[180px]">
                    <Skeleton className="h-5 w-28" />
                  </div>
                  <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-2">
                    {Array.from({ length: permCount }).map((_, permIndex) => (
                      <div
                        key={permIndex}
                        className="flex items-center gap-1.5"
                      >
                        <Skeleton className="size-4 rounded" />
                        <Skeleton
                          className="h-4"
                          style={{
                            width: `${permIndex === permCount - 1 ? 48 : 40 + Math.random() * 24}px`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons Skeleton */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Skeleton className="h-10 w-full sm:w-24" />
          <Skeleton className="h-10 w-full sm:w-36" />
        </div>
      </div>
    </div>
  );
}
