import { KeyIcon, Plus } from "lucide-react";
import { AlertCircle } from "lucide-react";
import AccessesTable from "@/components/system/administration/accesses/accesses-table";
import { getAllSystemAccesses } from "@/actions/system/access";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AccessesPage() {
  const result = await getAllSystemAccesses();

  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <KeyIcon className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Accesses</h1>
              <p className="text-muted-foreground mt-1">
                Manage system accesses
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/system/administration/accesses/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Access
            </Link>
          </Button>
        </div>
        {!result.success ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        ) : (
          <AccessesTable accesses={result.data || []} />
        )}
      </div>
    </div>
  );
}
