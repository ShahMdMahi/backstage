import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileTextIcon, UploadIcon, SettingsIcon } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <FileTextIcon className="size-5 text-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Create Reporting
              </h1>
              <p className="text-muted-foreground mt-1">
                Upload and configure a new reporting file
              </p>
            </div>
          </div>
        </div>

        {/* File Upload Section Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <UploadIcon className="size-5 text-muted-foreground" />
              <span className="font-semibold">File Upload</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload a CSV file for reporting (max 25MB)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-40" />
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Configuration Section Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <SettingsIcon className="size-5 text-muted-foreground" />
              <span className="font-semibold">Configuration</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure the reporting settings
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button Skeleton */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </div>
  );
}
