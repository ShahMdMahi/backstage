import { getCurrentSession } from "@/actions/shared/session";
import { getSystemAccessById } from "@/actions/system/access";
import { logout } from "@/actions/auth/auth";
import { redirect } from "next/navigation";
import { ROLE } from "@/lib/prisma/enums";
import { AccessEditForm } from "@/components/system/administration/accesses/access-edit-form";
import { Card, CardContent } from "@/components/ui/card";
import { XCircleIcon, PenIcon } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAccessPage({ params }: PageProps) {
  const id = (await params).id;

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

  const result = await getSystemAccessById(id);

  // Show custom not found message
  if (!result.success || !result.data) {
    return (
      <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
        <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
          {/* Page Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 sm:size-12">
              <PenIcon className="size-5 text-primary sm:size-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Edit System Access
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Modify system user access permissions
              </p>
            </div>
          </div>

          {/* Not Found Card */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <XCircleIcon className="size-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                Access Not Found
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-1">
                The system access you are trying to edit does not exist or has
                been removed.
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                ID: {id}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if trying to edit own access
  if (result.data.userId === session.data.userId) {
    return (
      <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
        <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
          {/* Page Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 sm:size-12">
              <PenIcon className="size-5 text-primary sm:size-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Edit System Access
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Modify system user access permissions
              </p>
            </div>
          </div>

          {/* Cannot Edit Own Access Card */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <XCircleIcon className="size-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                Cannot Edit Own Access
              </h2>
              <p className="text-muted-foreground text-center max-w-md">
                You cannot modify your own system access permissions. Please
                contact another administrator to make changes to your access.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if the user is suspended
  if (result.data.user?.suspendedAt) {
    return (
      <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
        <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
          {/* Page Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 sm:size-12">
              <PenIcon className="size-5 text-primary sm:size-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Edit System Access
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Modify system user access permissions
              </p>
            </div>
          </div>

          {/* User Suspended Card */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <XCircleIcon className="size-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                User Suspended
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-1">
                Cannot modify access permissions for a suspended user. Please
                unsuspend the user first.
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                User: {result.data.user?.name} ({result.data.user?.email})
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <AccessEditForm access={result.data} />;
}
