import { FileTextIcon, Plus } from "lucide-react";
import { XCircleIcon } from "lucide-react";
import ReportingsTable from "@/components/system/administration/reporting/reportings-table";
import { getAllReportings } from "@/actions/system/reporting";
import { getCurrentSession } from "@/actions/shared/session";
import { redirect } from "next/navigation";
import { ROLE, REPORTING_SYSTEM_ACCESS_LEVEL } from "@/lib/prisma/enums";
import { logout } from "@/actions/auth/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ReportingsPage() {
  const session = await getCurrentSession();
  if (!session.success) redirect("/auth/login");
  if (!session?.data?.user) redirect("/auth/login");
  if (
    session?.data?.user?.role !== ROLE.SYSTEM_OWNER &&
    session?.data?.user?.role !== ROLE.SYSTEM_ADMIN
  ) {
    if (session?.data?.user?.role === ROLE.SYSTEM_USER) {
      if (!session?.data?.user?.systemAccess) {
        const result = await logout();
        if (result.success) {
          redirect("/auth/login");
        } else {
          redirect("/auth/login");
        }
      }
      if (
        !session?.data?.user?.systemAccess?.reportingAccessLevel.includes(
          REPORTING_SYSTEM_ACCESS_LEVEL.VIEW
        )
      ) {
        redirect("/system");
      }
    } else {
      redirect("/");
    }
  }

  const reportings = await getAllReportings();

  const haveCreateAccess =
    session.data.user.role === ROLE.SYSTEM_OWNER ||
    session.data.user.role === ROLE.SYSTEM_ADMIN ||
    session.data.user.systemAccess?.reportingAccessLevel.includes(
      REPORTING_SYSTEM_ACCESS_LEVEL.CREATE
    );

  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 sm:size-12">
              <FileTextIcon className="size-5 text-primary sm:size-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Reporting</h1>
              <p className="text-muted-foreground mt-1">
                View and analyze system reports
              </p>
            </div>
          </div>
          {haveCreateAccess && (
            <div className="flex items-center gap-2">
              <Button asChild>
                <Link href="/system/administration/reporting/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Reporting
                </Link>
              </Button>
            </div>
          )}
        </div>
        {!reportings.success ? (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <XCircleIcon className="size-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                {reportings.message || "No Reportings Found"}
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-1">
                The reportings you are looking for do not exist or have been
                removed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ReportingsTable reportings={reportings.data || []} />
        )}
      </div>
    </div>
  );
}
