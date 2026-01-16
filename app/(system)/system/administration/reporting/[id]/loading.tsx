import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileTextIcon, UserIcon, UserCogIcon, CogIcon } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 sm:size-12">
              <FileTextIcon className="size-5 text-primary animate-pulse sm:size-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Reporting Details
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                View and analyze system reports
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
          </div>
        </div>

        {/* Reporting Info Card Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <FileTextIcon className="size-5 text-muted-foreground" />
              <span className="font-semibold">Reporting Information</span>
            </div>
            <p className="text-sm text-muted-foreground">
              General information about this reporting
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Reporting Summary Skeleton */}
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="size-16 rounded-lg" />
                <div className="text-center space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>

              {/* Reporting Details Skeleton */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
            </div>

            <Skeleton className="h-px w-full my-6" />

            {/* Revenue & Timestamps Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-full" />
                  {i >= 2 && <Skeleton className="h-3 w-3/4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Processing Card Skeleton */}
        <Card className="animate-pulse">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <CogIcon className="size-5 text-muted-foreground" />
              <span className="font-semibold">Processing</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Processing information for this reporting
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Processing Summary Skeleton */}
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="size-16 rounded-lg" />
                <div className="text-center space-y-2">
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>

              {/* Processing Details Skeleton */}
              <div className="flex-1 space-y-6">
                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>

                {/* Process Button Skeleton */}
                <div className="pt-2">
                  <Skeleton className="h-9 w-full sm:w-32" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uploader and Processor Cards Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Uploader Card Skeleton */}
          <Card className="animate-pulse">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2">
                <UserIcon className="size-5 text-muted-foreground" />
                <span className="font-semibold">Uploaded By</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The user who uploaded this reporting
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Skeleton className="size-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-px w-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processor Card Skeleton */}
          <Card className="animate-pulse">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2">
                <UserCogIcon className="size-5 text-muted-foreground" />
                <span className="font-semibold">Processed By</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The user who processed this reporting
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Skeleton className="size-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-px w-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
