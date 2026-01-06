"use client";

import { useState, useTransition } from "react";
import { SessionCard } from "@/components/shared/sessions/session-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ShieldXIcon } from "lucide-react";
import { Session } from "@/lib/prisma/browser";
import { toast } from "sonner";
import { revokeAllOtherSessionsForCurrentUser } from "@/actions/shared/session";

interface SessionsListProps {
  sessions: Session[];
  currentSession: Session;
}

export function isSessionRevoked(session: Session): boolean {
  return session.revokedAt !== null;
}

export function isSessionExpired(session: Session): boolean {
  return session.expiresAt < new Date();
}

export function isSessionActive(session: Session): boolean {
  return !isSessionRevoked(session) && !isSessionExpired(session);
}

export function getSessionStatus(
  session: Session
): "active" | "revoked" | "expired" {
  if (isSessionRevoked(session)) return "revoked";
  if (isSessionExpired(session)) return "expired";
  return "active";
}

export function SessionsList({
  sessions: initialSessions,
  currentSession,
}: SessionsListProps) {
  const [sessions, setSessions] = useState(initialSessions);
  const [isRevokingAll, startRevokingAll] = useTransition();

  const handleSessionUpdate = (sessionId: string, revokedAt: Date) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, revokedAt } : s))
    );
  };

  const handleSessionDelete = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleRevokeAllOtherSessions = () => {
    startRevokingAll(async () => {
      try {
        const result = await revokeAllOtherSessionsForCurrentUser();
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        toast.success("All other sessions have been revoked.");
        // Update all sessions except current one to revoked
        const now = new Date();
        setSessions((prev) =>
          prev.map((s) =>
            s.id !== currentSession.id ? { ...s, revokedAt: now } : s
          )
        );
      } catch (error) {
        console.error("Error revoking all sessions:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  };

  const activeSessions = sessions.filter((s) => isSessionActive(s));
  const inactiveSessions = sessions.filter((s) => !isSessionActive(s));

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">
              All Sessions ({sessions.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeSessions.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive ({inactiveSessions.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-4">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              currentSession={currentSession}
              onSessionUpdate={handleSessionUpdate}
              onSessionDelete={handleSessionDelete}
            />
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeSessions.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              No active sessions
            </div>
          ) : (
            activeSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                currentSession={currentSession}
                onSessionUpdate={handleSessionUpdate}
                onSessionDelete={handleSessionDelete}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {inactiveSessions.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              No inactive sessions
            </div>
          ) : (
            inactiveSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                currentSession={currentSession}
                onSessionUpdate={handleSessionUpdate}
                onSessionDelete={handleSessionDelete}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRevokeAllOtherSessions}
        disabled={isRevokingAll}
      >
        <ShieldXIcon className="size-4 mr-2" />
        {isRevokingAll ? "Revoking..." : "Revoke All Other"}
      </Button>
    </div>
  );
}
