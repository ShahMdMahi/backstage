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
import { Trash2Icon } from "lucide-react";
import { deleteSystemAccess } from "@/actions/system/access";

interface DeleteAccessButtonProps {
  accessId: string;
  userName: string;
}

export function DeleteAccessButton({
  accessId,
  userName,
}: DeleteAccessButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteSystemAccess(accessId);
      if (result.success) {
        toast.success(result.message || "Access deleted successfully");
        router.push("/system/administration/accesses");
      } else {
        toast.error(result.message || "Failed to delete access");
        setOpen(false);
      }
    } catch (error) {
      console.error("Error deleting access:", error);
      toast.error("An error occurred while deleting access");
      setOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-1.5">
          <Trash2Icon className="size-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete System Access</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the system access for{" "}
            <span className="font-semibold text-foreground">{userName}</span>?
            This action cannot be undone and will immediately revoke all their
            system permissions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Spinner className="mr-2 size-4" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2Icon className="mr-2 size-4" />
                Delete Access
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
