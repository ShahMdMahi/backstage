import { Users, Plus, AlertCircle } from "lucide-react";
import UsersTable from "@/components/system/administration/users/users-table";
import { getAllUsers } from "@/actions/system/user";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentSession } from "@/actions/shared/session";
import { redirect } from "next/navigation";
import { ROLE, USER_SYSTEM_ACCESS_LEVEL } from "@/lib/prisma/enums";
import { logout } from "@/actions/auth/auth";

export default async function UsersPage() {
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
        !session?.data?.user?.systemAccess?.usersAccessLevel.includes(
          USER_SYSTEM_ACCESS_LEVEL.VIEW
        )
      ) {
        redirect("/system");
      }
    } else {
      redirect("/");
    }
  }

  const users = await getAllUsers();

  const haveCreateAccess =
    session.data.user.role === ROLE.SYSTEM_OWNER ||
    session.data.user.role === ROLE.SYSTEM_ADMIN ||
    session.data.user.systemAccess?.usersAccessLevel.includes(
      USER_SYSTEM_ACCESS_LEVEL.CREATE
    );

  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Users</h1>
              <p className="text-muted-foreground mt-1">Manage system users</p>
            </div>
          </div>
          {haveCreateAccess && (
            <Button asChild>
              <Link href="/system/administration/users/create">
                <Plus className="mr-2 h-4 w-4" />
                Create User
              </Link>
            </Button>
          )}
        </div>
        {!users.success ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{users.message}</AlertDescription>
          </Alert>
        ) : (
          <UsersTable session={session.data} users={users.data || []} />
        )}
      </div>
    </div>
  );
}
