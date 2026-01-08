import { SessionCardSkeleton } from "@/components/shared/sessions/session-card-skeleton";
import { ShieldIcon } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full max-w-none px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 sm:size-12">
            <ShieldIcon className="size-5 text-primary sm:size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Sessions
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage your active sessions across all devices
            </p>
          </div>
        </div>

        {/* Loading Skeletons */}
        <div className="space-y-4">
          <SessionCardSkeleton />
          <SessionCardSkeleton />
          <SessionCardSkeleton />
        </div>
      </div>
    </div>
  );
}
