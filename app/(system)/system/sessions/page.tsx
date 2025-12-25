import { Suspense } from "react";
import { SessionsList } from "@/components/shared/sessions/session-list";
import { SessionCardSkeleton } from "@/components/shared/sessions/session-card-skeleton";
import { ShieldIcon } from "lucide-react";
import {
  getAllSessionsForUser,
  getCurrentSession,
} from "@/actions/shared/session";

export const dynamic = "force-dynamic";

async function SessionsContent() {
  const currentSession = await getCurrentSession();
  const sessions = await getAllSessionsForUser(currentSession.data!.userId);

  return (
    <SessionsList
      sessions={sessions.data!}
      currentSession={currentSession.data!}
    />
  );
}

function SessionsLoading() {
  return (
    <div className="space-y-4">
      <SessionCardSkeleton />
      <SessionCardSkeleton />
      <SessionCardSkeleton />
    </div>
  );
}

export default function SessionsPage() {
  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        <div className="flex items-center gap-3">
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

        <Suspense fallback={<SessionsLoading />}>
          <SessionsContent />
        </Suspense>
      </div>
    </div>
  );
}
