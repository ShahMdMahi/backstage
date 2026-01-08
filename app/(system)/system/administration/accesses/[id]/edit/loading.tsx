import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PenIcon,
  UserIcon,
  CalendarIcon,
  AlertTriangleIcon,
  ShieldCheckIcon,
} from "lucide-react";

// Access categories count for skeleton
const accessCategoriesCount = 20;

export default function Loading() {
  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <PenIcon className="size-5 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit System Access
            </h1>
            <p className="text-muted-foreground mt-1">
              Modify system user access permissions for system resources
            </p>
          </div>
        </div>

        {/* User Info Card Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <UserIcon className="size-5 text-muted-foreground" />
              <span className="font-semibold">Assigned User</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The system user with this access (cannot be changed)
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Skeleton className="size-16 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-px w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
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
              Set when this access should expire
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Suspend Access Card Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="size-5 text-muted-foreground" />
              <span className="font-semibold">Access Status</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Suspend this access to temporarily disable all permissions
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
              <Skeleton className="size-4 rounded mt-0.5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Card Skeleton */}
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-5 text-muted-foreground" />
              <span className="font-semibold">Access Permissions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure granular access permissions for each category
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: accessCategoriesCount }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg border p-3 animate-pulse"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="md:min-w-[180px] md:max-w-[180px]">
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-2">
                    {[48, 56, 52, 60, 44].map((width, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Skeleton className="size-4 rounded" />
                        <Skeleton
                          className="h-4 rounded"
                          style={{ width: `${width}px` }}
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
