import { KeyIcon, Plus } from "lucide-react";
import { XCircleIcon } from "lucide-react";
import AccessesTable from "@/components/system/administration/accesses/accesses-table";
import { getAllSystemAccesses } from "@/actions/system/access";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentSession } from "@/actions/shared/session";
import { redirect } from "next/navigation";
import { ROLE } from "@/lib/prisma/enums";
import { logout } from "@/actions/auth/auth";
import { Card, CardContent } from "@/components/ui/card";

export default async function AccessesPage() {
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
      redirect("/system");
    } else {
      redirect("/");
    }
  }

  const accesses = await getAllSystemAccesses();

  const haveCreateAccess =
    session.data.user.role === ROLE.SYSTEM_OWNER ||
    session.data.user.role === ROLE.SYSTEM_ADMIN;

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
          {haveCreateAccess && (
            <Button asChild>
              <Link href="/system/administration/accesses/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Access
              </Link>
            </Button>
          )}
        </div>
        {!accesses.success ? (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <XCircleIcon className="size-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                No System Access Found
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-1">
                The system accesses you are looking for do not exist or have
                been removed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <AccessesTable accesses={accesses.data || []} />
        )}
      </div>
    </div>
  );
}
