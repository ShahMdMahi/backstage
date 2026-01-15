import { logout } from "@/actions/auth/auth";
import { getCurrentSession } from "@/actions/shared/session";
import { REPORTING_SYSTEM_ACCESS_LEVEL, ROLE } from "@/lib/prisma/enums";
import { redirect } from "next/navigation";
import ReportingForm from "@/components/system/administration/reporting/reporting-form";

export const dynamic = "force-dynamic";

export default async function CreateReportingPage() {
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
          REPORTING_SYSTEM_ACCESS_LEVEL.CREATE
        )
      ) {
        redirect("/system");
      }
    } else {
      redirect("/");
    }
  }

  return <ReportingForm />;
}
