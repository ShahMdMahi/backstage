"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ShieldXIcon } from "lucide-react";
import { revokeSessionById } from "@/actions/shared/session";

interface RevokeSessionButtonProps {
  sessionId: string;
  deviceName: string;
}

export function RevokeSessionButton({
  sessionId,
  deviceName,
}: RevokeSessionButtonProps) {
  const router = useRouter();
  const [isRevoking, setIsRevoking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleRevoke = async () => {
    setIsRevoking(true);
    try {
      const result = await revokeSessionById(sessionId);

      if (result.success) {
        toast.success("Session revoked successfully");
        router.refresh();
        setIsOpen(false);
      } else {
        toast.error(result.message || "Failed to revoke session");
      }
    } catch (error) {
      console.error("Error revoking session:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <ShieldXIcon className="mr-2 size-4" />
          Revoke
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        onEscapeKeyDown={(e) => {
          if (isRevoking) e.preventDefault();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to revoke this session for &quot;
            {deviceName}
            &quot;? This action cannot be undone and will immediately log out
            this device.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRevoking}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleRevoke();
            }}
            disabled={isRevoking}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isRevoking ? (
              <>
                <Spinner className="mr-2" />
                Revoking...
              </>
            ) : (
              "Revoke Session"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
