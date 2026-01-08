import { getUserById } from "@/actions/system/user";
import { UserEditForm } from "@/components/system/administration/users/user-edit-form";
import { Card, CardContent } from "@/components/ui/card";
import { PenIcon, XCircleIcon } from "lucide-react";
import { getCurrentSession } from "@/actions/shared/session";
import { redirect } from "next/navigation";
import { ROLE, USER_SYSTEM_ACCESS_LEVEL } from "@/lib/prisma/enums";
import { logout } from "@/actions/auth/auth";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserEditPage({ params }: PageProps) {
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
      if (
        !session?.data?.user?.systemAccess?.usersAccessLevel.includes(
          USER_SYSTEM_ACCESS_LEVEL.UPDATE
        )
      ) {
        redirect("/system");
      }
    } else {
      redirect("/");
    }
  }

  const userResult = await getUserById(id);

  if (!userResult.success || !userResult.data) {
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
                Edit User
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Update user information
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
                User Not Found
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-1">
                The user you are looking for does not exist or has been removed.
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

  const user = userResult.data;

  // Check if user is verified
  if (!user.verifiedAt) {
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
                Edit User
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Update user information
              </p>
            </div>
          </div>

          {/* Not Verified Card */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <XCircleIcon className="size-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                User Not Verified
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-1">
                This user must be verified before they can be edited.
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                User: {user.name} ({user.email})
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if user is approved
  if (!user.approvedAt) {
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
                Edit User
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Update user information
              </p>
            </div>
          </div>

          {/* Not Approved Card */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <XCircleIcon className="size-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                User Not Approved
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-1">
                This user must be approved before they can be edited.
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                User: {user.name} ({user.email})
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if current user can edit this user
  const canEdit = (() => {
    if (session.data.user.id === user.id) return false;
    if (session.data.user.role === ROLE.SYSTEM_OWNER) return true;
    if (session.data.user.role === ROLE.SYSTEM_ADMIN) {
      return user.role !== ROLE.SYSTEM_OWNER && user.role !== ROLE.SYSTEM_ADMIN;
    }
    if (session.data.user.role === ROLE.SYSTEM_USER) {
      return (
        user.role === ROLE.USER &&
        session.data.user.systemAccess?.usersAccessLevel.includes(
          USER_SYSTEM_ACCESS_LEVEL.UPDATE
        )
      );
    }
    return false;
  })();

  if (!canEdit) {
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
                Edit User
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Update user information
              </p>
            </div>
          </div>

          {/* Access Denied Card */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <XCircleIcon className="size-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                Access Denied
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-1">
                You do not have permission to edit this user.
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                User: {user.name} ({user.email})
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Determine available roles for the role dropdown
  const getAvailableRoles = () => {
    // SYSTEM_OWNER role cannot be assigned by anyone
    // SYSTEM_USER cannot change roles (handled in canChangeRole logic)
    if (session?.data?.user.role === ROLE.SYSTEM_OWNER) {
      return [ROLE.SYSTEM_ADMIN, ROLE.SYSTEM_USER, ROLE.USER];
    }
    if (session?.data?.user.role === ROLE.SYSTEM_ADMIN) {
      return [ROLE.SYSTEM_USER, ROLE.USER];
    }
    return [ROLE.USER];
  };

  return (
    <UserEditForm
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || "",
        role: user.role as ROLE,
        suspendedAt: user.suspendedAt,
        systemAccess: user.systemAccess ? { id: user.systemAccess.id } : null,
        assignedSystemAccesses: user.assignedSystemAccesses.map((access) => ({
          id: access.id,
        })),
        ownWorkspaceAccount: user.ownWorkspaceAccount
          ? { id: user.ownWorkspaceAccount.id }
          : null,
        sharedWorkspaceAccountAccess: user.sharedWorkspaceAccountAccess
          ? { id: user.sharedWorkspaceAccountAccess.id }
          : null,
        assignedWorkspaceAccountAccesses:
          user.assignedWorkspaceAccountAccesses.map((access) => ({
            id: access.id,
          })),
      }}
      availableRoles={getAvailableRoles()}
      currentUserRole={session.data.user.role as ROLE}
    />
  );
}
