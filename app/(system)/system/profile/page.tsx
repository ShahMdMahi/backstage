import { getCurrentSession } from "@/actions/shared/session";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { UpdateProfileForm } from "@/components/shared/profile/update-profile-form";
import { UpdatePasswordForm } from "@/components/shared/profile/update-password-form";
import { ROLE } from "@/lib/prisma/enums";
import { getInitials } from "@/lib/utils";
import { formatInTimeZone } from "date-fns-tz";
import { UserIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Profile() {
  const session = await getCurrentSession();

  if (!session.success || !session.data) {
    redirect("/auth/login");
  }

  const user = session.data.user;
  const initals = getInitials(user.name);

  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <UserIcon className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account information
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
              <Avatar className="h-16 w-16 rounded-full border-2 border-border sm:h-20 sm:w-20">
                <AvatarImage src={user.avatar || ""} alt={user.name} />
                <AvatarFallback>{initals}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold sm:text-2xl">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <Badge
                  variant={
                    user.role === ROLE.SYSTEM_OWNER
                      ? "destructive"
                      : user.role === ROLE.SYSTEM_ADMIN
                        ? "default"
                        : user.role === ROLE.SYSTEM_USER
                          ? "outline"
                          : "secondary"
                  }
                  className="mt-1"
                >
                  {user.role.replaceAll("_", " ")}
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Phone</label>
                <p>{user.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Verified</label>
                {user.verifiedAt ? (
                  <div>
                    <p>
                      {formatInTimeZone(
                        user.verifiedAt,
                        "Asia/Dhaka",
                        "dd/MM/yyyy"
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatInTimeZone(
                        user.verifiedAt,
                        "Asia/Dhaka",
                        "hh:mm a"
                      )}
                    </p>
                  </div>
                ) : (
                  <p>No</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Approved</label>
                {user.approvedAt ? (
                  <div>
                    <p>
                      {formatInTimeZone(
                        user.approvedAt,
                        "Asia/Dhaka",
                        "dd/MM/yyyy"
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatInTimeZone(
                        user.approvedAt,
                        "Asia/Dhaka",
                        "hh:mm a"
                      )}
                    </p>
                  </div>
                ) : (
                  <p>No</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Suspended</label>
                {user.suspendedAt ? (
                  <div>
                    <p>
                      {formatInTimeZone(
                        user.suspendedAt,
                        "Asia/Dhaka",
                        "dd/MM/yyyy"
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatInTimeZone(
                        user.suspendedAt,
                        "Asia/Dhaka",
                        "hh:mm a"
                      )}
                    </p>
                  </div>
                ) : (
                  <p>No</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Created At</label>
                <div>
                  <p>
                    {formatInTimeZone(
                      user.createdAt,
                      "Asia/Dhaka",
                      "dd/MM/yyyy"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatInTimeZone(user.createdAt, "Asia/Dhaka", "hh:mm a")}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Updated At</label>
                <div>
                  <p>
                    {formatInTimeZone(
                      user.updatedAt,
                      "Asia/Dhaka",
                      "dd/MM/yyyy"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatInTimeZone(user.updatedAt, "Asia/Dhaka", "hh:mm a")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <UpdateProfileForm user={user} />

        <UpdatePasswordForm />
      </div>
    </div>
  );
}
