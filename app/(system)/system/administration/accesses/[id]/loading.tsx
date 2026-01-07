import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldCheckIcon,
  HashIcon,
  UserIcon,
  UserCogIcon,
  BarChart3Icon,
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
            <ShieldCheckIcon className="size-5 text-primary animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Access Details
              </h1>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <p className="text-muted-foreground mt-1">
              View system access permissions and details
            </p>
          </div>
        </div>

        {/* Access Info Card Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <HashIcon className="size-5 text-muted-foreground" />
              <span className="font-semibold">Access Information</span>
            </div>
            <p className="text-sm text-muted-foreground">
              General information about this system access
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Access ID */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-full" />
              </div>
              {/* Created At */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              {/* Updated At */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              {/* Expires At */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User and Assigner Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* User Card Skeleton */}
          <Card className="animate-pulse">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2">
                <UserIcon className="size-5 text-muted-foreground" />
                <span className="font-semibold">Assigned User</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The user who has been granted this access
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

          {/* Assigner Card Skeleton */}
          <Card className="animate-pulse">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2">
                <UserCogIcon className="size-5 text-muted-foreground" />
                <span className="font-semibold">Assigned By</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The administrator who granted this access
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
        </div>

        {/* Permissions Card Skeleton */}
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-5 text-muted-foreground" />
              <span className="font-semibold">Access Permissions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Detailed breakdown of all granted permissions by category
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: accessCategoriesCount }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg border p-4 animate-pulse"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex items-center gap-3 sm:min-w-[220px]">
                    <Skeleton className="size-9 rounded-lg" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    {[60, 72, 55].map((width, i) => (
                      <Skeleton
                        key={i}
                        className="h-5 rounded-full"
                        style={{ width: `${width}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Summary Stats Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3Icon className="size-5 text-muted-foreground" />
              <span className="font-semibold">Permissions Summary</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Quick overview of granted permissions
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg border bg-card p-4 text-center"
                >
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
