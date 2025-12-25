"use client";

import { useState } from "react";
import { SessionCard } from "@/components/shared/sessions/session-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Session } from "@/lib/prisma/browser";

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

  const handleSessionUpdate = (sessionId: string, revokedAt: Date) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, revokedAt } : s))
    );
  };

  const handleSessionDelete = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const activeSessions = sessions.filter((s) => isSessionActive(s));
  const inactiveSessions = sessions.filter((s) => !isSessionActive(s));

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList>
        <TabsTrigger value="all">All Sessions ({sessions.length})</TabsTrigger>
        <TabsTrigger value="active">
          Active ({activeSessions.length})
        </TabsTrigger>
        <TabsTrigger value="inactive">
          Inactive ({inactiveSessions.length})
        </TabsTrigger>
      </TabsList>

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
  );
}
