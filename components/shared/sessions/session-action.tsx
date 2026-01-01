"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldXIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Session } from "@/lib/prisma/browser";
import { toast } from "sonner";
import { revokeSessionById } from "@/actions/shared/session";

interface SessionActionsProps {
  session: Session;
  currentSession: Session;
  onSessionUpdate?: (sessionId: string, revokedAt: Date) => void;
  onSessionDelete?: (sessionId: string) => void;
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

export function SessionActions({
  session,
  currentSession,
  onSessionUpdate,
  onSessionDelete,
}: SessionActionsProps) {
  const [isRevoking, setIsRevoking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Cannot delete if active (not revoked and not expired)
  // const canDelete = !isSessionActive(session);

  // Cannot revoke if already revoked or expired
  const canRevoke = isSessionActive(session);

  const handleRevoke = async () => {
    try {
      setIsRevoking(true);
      const revokedSession = await revokeSessionById(session.id);
      if (!revokedSession.success) {
        toast.error("Failed to revoke the session. Please try again.");
        return;
      }
      toast.success("The session has been successfully revoked.");
      onSessionUpdate?.(session.id, revokedSession.data!.revokedAt!);
    } catch (error) {
      console.error("Error revoking session:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsRevoking(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onSessionDelete?.(session.id);
    toast.success("The session has been successfully deleted.");
    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  // Don't show actions for current session
  if (session.id === currentSession.id) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Current Session</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {canRevoke && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevoke}
            disabled={isRevoking}
          >
            <ShieldXIcon className="size-4" />
            {isRevoking ? "Revoking..." : "Revoke"}
          </Button>
        )}
        {/* <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={!canDelete || isDeleting}
        >
          <Trash2Icon className="size-4" />
          Delete
        </Button> */}
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this session? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
