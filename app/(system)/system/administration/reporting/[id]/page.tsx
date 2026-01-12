import { logout } from "@/actions/auth/auth";
import { getCurrentSession } from "@/actions/shared/session";
import { REPORTING_SYSTEM_ACCESS_LEVEL, ROLE } from "@/lib/prisma/enums";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportingPage({ params }: PageProps) {
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

  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          Reporting
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          View and analyze system reports for ID: {id}
        </p>
      </div>
    </div>
  );
}
