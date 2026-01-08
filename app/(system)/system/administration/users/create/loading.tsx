import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UserPlusIcon,
  UserIcon,
  LockIcon,
  ImageIcon,
  ShieldIcon,
} from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full max-w-none px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 sm:size-12">
              <UserPlusIcon className="size-5 text-primary animate-pulse sm:size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Create User
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Add a new user to the system
              </p>
            </div>
          </div>
        </div>

        {/* Avatar Section Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="size-5 text-muted-foreground" />
              <span className="font-semibold">Profile Picture</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload an optional profile picture for the user
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Skeleton className="size-24 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <UserIcon className="size-5 text-muted-foreground" />
              <span className="font-semibold">Basic Information</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter the user&apos;s basic details
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Password Section Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <LockIcon className="size-5 text-muted-foreground" />
              <span className="font-semibold">Password</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Set the initial password for the user
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-28" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Section Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldIcon className="size-5 text-muted-foreground" />
              <span className="font-semibold">User Role</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Assign a role to the new user
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons Skeleton */}
        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
