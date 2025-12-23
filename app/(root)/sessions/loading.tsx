import { SessionCardSkeleton } from "@/components/root/sessions/session-card-skeleton";
import { ShieldIcon } from "lucide-react";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <ShieldIcon className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
            <p className="text-muted-foreground mt-1">
              Manage your active sessions across all devices
            </p>
          </div>
        </div>
      </div>

      {/* Loading Skeletons */}
      <div className="space-y-4">
        <SessionCardSkeleton />
        <SessionCardSkeleton />
        <SessionCardSkeleton />
      </div>
    </div>
  );
}
