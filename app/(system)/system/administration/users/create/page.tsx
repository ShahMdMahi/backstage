import { UserForm } from "@/components/system/administration/users/user-form";
import { getCurrentSession } from "@/actions/shared/session";
import { redirect } from "next/navigation";
import { ROLE, USER_SYSTEM_ACCESS_LEVEL } from "@/lib/prisma/enums";
import { logout } from "@/actions/auth/auth";

export default async function CreateUserPage() {
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
          USER_SYSTEM_ACCESS_LEVEL.CREATE
        )
      ) {
        redirect("/system/administration/users");
      }
    } else {
      redirect("/");
    }
  }

  return <UserForm session={session.data} />;
}
