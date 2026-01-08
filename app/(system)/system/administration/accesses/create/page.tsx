import { AccessForm } from "@/components/system/administration/accesses/access-form";
import { getAllSystemUsers } from "@/actions/system/user";
import { ShieldCheckIcon, XCircleIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentSession } from "@/actions/shared/session";
import { redirect } from "next/navigation";
import { ROLE } from "@/lib/prisma/enums";
import { logout } from "@/actions/auth/auth";

export default async function CreateAccessPage() {
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

  const systemUsers = await getAllSystemUsers();

  if (!systemUsers.success || !systemUsers.data) {
    return (
      <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
        <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
          {/* Page Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 sm:size-12">
              <ShieldCheckIcon className="size-5 text-primary sm:size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                System Access Management
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Configure user access permissions for system resources
              </p>
            </div>
          </div>

          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <XCircleIcon className="size-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                No System Users Found
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-1">
                Theere is no system user without system access in the system. To
                create system access, you must first create system users and
                approve them.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <AccessForm users={systemUsers.data} />;
}
