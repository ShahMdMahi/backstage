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
import { PlayIcon } from "lucide-react";
import { processReporting } from "@/actions/system/reporting";

interface ProcessReportingButtonProps {
  reportingId: string;
  reportingName: string;
}

export function ProcessReportingButton({
  reportingId,
  reportingName,
}: ProcessReportingButtonProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [open, setOpen] = useState(false);

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      const result = await processReporting(reportingId);
      if (result.success) {
        console.log(result.data);
        toast.success(result.message || "Reporting processed successfully");
        router.push("/system/administration/reporting");
      } else {
        toast.error(result.message || "Failed to process reporting");
        setOpen(false);
      }
    } catch (error) {
      console.error("Error processing reporting:", error);
      toast.error("An error occurred while processing reporting");
      setOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 bg-green-600 text-white hover:bg-green-700"
        >
          <PlayIcon className="size-4" />
          Process
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Process Reporting</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to process the reporting{" "}
            <span className="font-semibold text-foreground">
              {reportingName}
            </span>
            ? This action will process all associated data for this reporting
            and can take some time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleProcess}
            disabled={isProcessing}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {isProcessing ? (
              <>
                <Spinner className="mr-2 size-4" />
                Processing...
              </>
            ) : (
              <>
                <PlayIcon className="mr-2 size-4" />
                Process Reporting
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
