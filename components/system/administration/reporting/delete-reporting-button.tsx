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
import { deleteReporting } from "@/actions/system/reporting";

interface DeleteReportingButtonProps {
  reportingId: string;
  reportingName: string;
}

export function DeleteReportingButton({
  reportingId,
  reportingName,
}: DeleteReportingButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteReporting(reportingId);
      if (result.success) {
        toast.success(result.message || "Reporting deleted successfully");
        router.push("/system/administration/reporting");
      } else {
        toast.error(result.message || "Failed to delete reporting");
        setOpen(false);
      }
    } catch (error) {
      console.error("Error deleting reporting:", error);
      toast.error("An error occurred while deleting reporting");
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
          <AlertDialogTitle>Delete Reporting</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the reporting{" "}
            <span className="font-semibold text-foreground">
              {reportingName}
            </span>
            ? This action cannot be undone and will permanently remove all
            associated data.
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
                Delete Reporting
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
