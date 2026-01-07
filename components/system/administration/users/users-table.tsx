"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  Eye,
  Pencil,
  OctagonX,
  OctagonAlert,
  Search,
} from "lucide-react";
import { Session, SystemAccess, User } from "@/lib/prisma/browser";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROLE, USER_SYSTEM_ACCESS_LEVEL } from "@/lib/prisma/enums";
import { useRouter } from "next/navigation";
import {
  approveUserById,
  suspendUserById,
  unsuspendUserById,
} from "@/actions/system/user";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface UsersTableProps {
  session: Session & { user: User & { systemAccess: SystemAccess | null } };
  users: Partial<User>[];
}

function formatDateAndTime(date: Date | null): { date: string; time: string } {
  if (!date) return { date: "N/A", time: "" };
  const bdTime = toZonedTime(new Date(date), "Asia/Dhaka");
  const datePart = format(bdTime, "dd/MM/yyyy");
  const timePart = format(bdTime, "hh:mm:ss a");
  return { date: datePart, time: timePart };
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRole(role: string): string {
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function UsersTable({ session, users }: UsersTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [unsuspendDialogOpen, setUnsuspendDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [isUnsuspending, setIsUnsuspending] = useState(false);

  const handleApprove = async () => {
    if (!selectedUser?.id) return;
    setIsApproving(true);
    try {
      const result = await approveUserById(selectedUser.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsApproving(false);
      setApproveDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser?.id) return;
    setIsSuspending(true);
    try {
      const result = await suspendUserById(selectedUser.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsSuspending(false);
      setSuspendDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleUnsuspend = async () => {
    if (!selectedUser?.id) return;
    setIsUnsuspending(true);
    try {
      const result = await unsuspendUserById(selectedUser.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsUnsuspending(false);
      setUnsuspendDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter((user) => {
      return (
        user.id?.toLowerCase().includes(query) ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
      );
    });
  }, [users, searchQuery]);

  const isSysOwner = session.user.role === ROLE.SYSTEM_OWNER;
  const isSysAdmin = session.user.role === ROLE.SYSTEM_ADMIN;
  const isSysUser = session.user.role === ROLE.SYSTEM_USER;

  const haveApproveAccess =
    isSysOwner ||
    isSysAdmin ||
    session.user.systemAccess?.usersAccessLevel.includes(
      USER_SYSTEM_ACCESS_LEVEL.APPROVE
    );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by ID, name, email, phone, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="grid w-full [&>div]:max-h-[520px] [&>div]:border [&>div]:rounded">
        <Table>
          <TableHeader>
            <TableRow className="*:whitespace-nowrap sticky top-0 bg-background after:content-[''] after:inset-x-0 after:h-px after:bg-border after:absolute after:bottom-0">
              <TableHead className="pl-4">Avatar</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Approved</TableHead>
              <TableHead>Suspended</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-hidden">
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center h-24">
                  {searchQuery.trim()
                    ? "No users found matching your search."
                    : "No users found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                // Check if user can be suspended
                const canSuspend = (() => {
                  // Can't suspend yourself
                  if (session.user.id === user.id) return false;

                  if (isSysOwner) return true;
                  if (isSysAdmin) {
                    return (
                      user.role === ROLE.SYSTEM_USER || user.role === ROLE.USER
                    );
                  }
                  if (isSysUser) {
                    return (
                      user.role === ROLE.USER &&
                      session.user.systemAccess?.usersAccessLevel.includes(
                        USER_SYSTEM_ACCESS_LEVEL.SUSPEND
                      )
                    );
                  }
                  return false;
                })();

                // Check if user can be edited
                const canEdit = (() => {
                  // Can't edit yourself
                  if (session.user.id === user.id) return false;

                  if (isSysOwner) return true;
                  if (isSysAdmin) {
                    return (
                      user.role === ROLE.SYSTEM_USER || user.role === ROLE.USER
                    );
                  }
                  if (isSysUser) {
                    return (
                      user.role === ROLE.USER &&
                      session.user.systemAccess?.usersAccessLevel.includes(
                        USER_SYSTEM_ACCESS_LEVEL.UPDATE
                      )
                    );
                  }
                  return false;
                })();

                return (
                  <TableRow
                    key={user.id}
                    className="odd:bg-muted/50 *:whitespace-nowrap"
                  >
                    <TableCell className="pl-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.avatar || undefined}
                          alt={user.name || ""}
                        />
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {user.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {user.phone || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === ROLE.SYSTEM_OWNER
                            ? "destructive"
                            : user.role === ROLE.SYSTEM_ADMIN
                              ? "default"
                              : user.role === ROLE.SYSTEM_USER
                                ? "secondary"
                                : "outline"
                        }
                        className="w-fit text-xs text-center"
                      >
                        <div className="flex flex-col leading-tight">
                          {user.role?.split("_").map((word, i) => (
                            <span key={i}>{formatRole(word)}</span>
                          ))}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <div className="text-sm">
                          {formatDateAndTime(user.createdAt || null).date}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateAndTime(user.createdAt || null).time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.verifiedAt ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="text-sm">
                            {formatDateAndTime(user.verifiedAt).date}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDateAndTime(user.verifiedAt).time}
                          </div>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Not Verified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.approvedAt ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="text-sm">
                            {formatDateAndTime(user.approvedAt).date}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDateAndTime(user.approvedAt).time}
                          </div>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Not Approved
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.suspendedAt ? (
                        <div className="flex flex-col gap-0.5">
                          <Badge
                            variant="destructive"
                            className="text-xs w-fit"
                          >
                            {formatDateAndTime(user.suspendedAt).date}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {formatDateAndTime(user.suspendedAt).time}
                          </div>
                        </div>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex gap-2">
                          {haveApproveAccess &&
                            user.verifiedAt &&
                            !user.approvedAt && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setApproveDialogOpen(true);
                                    }}
                                  >
                                    <BadgeCheck className="h-4 w-4" />
                                    <span className="sr-only">
                                      Approve User
                                    </span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Approve User</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                onClick={() => {
                                  router.push(
                                    `/system/administration/users/${user.id}`
                                  );
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View User</p>
                            </TooltipContent>
                          </Tooltip>
                          {canSuspend &&
                            user.verifiedAt &&
                            user.approvedAt &&
                            (user.suspendedAt ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setUnsuspendDialogOpen(true);
                                    }}
                                  >
                                    <OctagonAlert className="h-4 w-4" />
                                    <span className="sr-only">Unsuspend</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Unsuspend User</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setSuspendDialogOpen(true);
                                    }}
                                  >
                                    <OctagonX className="h-4 w-4" />
                                    <span className="sr-only">Suspend</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Suspend User</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          {canEdit && user.verifiedAt && user.approvedAt && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                                  onClick={() => {
                                    router.push(
                                      `/system/administration/users/${user.id}/edit`
                                    );
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit User</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog
        open={approveDialogOpen}
        onOpenChange={(open) => {
          if (!isApproving) setApproveDialogOpen(open);
        }}
      >
        <AlertDialogContent
          onEscapeKeyDown={(e) => isApproving && e.preventDefault()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Approve User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve{" "}
              <span className="font-semibold">{selectedUser?.name}</span>? This
              will grant them access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApproving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Approving...
                </>
              ) : (
                "Approve"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Confirmation Dialog */}
      <AlertDialog
        open={suspendDialogOpen}
        onOpenChange={(open) => {
          if (!isSuspending) setSuspendDialogOpen(open);
        }}
      >
        <AlertDialogContent
          onEscapeKeyDown={(e) => isSuspending && e.preventDefault()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend{" "}
              <span className="font-semibold">{selectedUser?.name}</span>? This
              will revoke their access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSuspending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              disabled={isSuspending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSuspending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Suspending...
                </>
              ) : (
                "Suspend"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsuspend Confirmation Dialog */}
      <AlertDialog
        open={unsuspendDialogOpen}
        onOpenChange={(open) => {
          if (!isUnsuspending) setUnsuspendDialogOpen(open);
        }}
      >
        <AlertDialogContent
          onEscapeKeyDown={(e) => isUnsuspending && e.preventDefault()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Unsuspend User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unsuspend{" "}
              <span className="font-semibold">{selectedUser?.name}</span>? This
              will revoke their access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSuspending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnsuspend}
              disabled={isUnsuspending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUnsuspending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Unsuspending...
                </>
              ) : (
                "Unsuspend"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
