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
import { Button } from "@/components/ui/button";
import { BadgeCheck, Eye, Pencil, Search } from "lucide-react";
import { Session, SystemAccess, User } from "@/lib/prisma/browser";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROLE, USER_SYSTEM_ACCESS_LEVEL } from "@/lib/prisma/enums";
import { useRouter } from "next/navigation";
import { approveUserById } from "@/actions/system/users";
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
  const [approvingUserIds, setApprovingUserIds] = useState<Set<string>>(
    new Set()
  );

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

  const haveEditAccess =
    session.user.role === ROLE.SYSTEM_OWNER ||
    session.user.role === ROLE.SYSTEM_ADMIN ||
    session.user.systemAccess?.usersAccessLevel.includes(
      USER_SYSTEM_ACCESS_LEVEL.UPDATE
    );

  const haveApproveAccess =
    session.user.role === ROLE.SYSTEM_OWNER ||
    session.user.systemAccess?.usersAccessLevel.includes(
      USER_SYSTEM_ACCESS_LEVEL.APPROVE
    );

  const handleApproveUser = async (userId: string) => {
    setApprovingUserIds((prev) => new Set(prev).add(userId));
    try {
      const result = await approveUserById(userId);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to approve user");
      console.error(error);
    } finally {
      setApprovingUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

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
              <TableHead>Registered At</TableHead>
              <TableHead>Verified At</TableHead>
              <TableHead>Approved At</TableHead>
              <TableHead>Suspended At</TableHead>
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
              filteredUsers.map((user) => (
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
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{user.id}</TableCell>
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
                        <Badge variant="destructive" className="text-xs w-fit">
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
                    <div className="flex gap-2">
                      {haveApproveAccess &&
                        user.verifiedAt &&
                        !user.approvedAt && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleApproveUser(user.id!)}
                            disabled={approvingUserIds.has(user.id!)}
                          >
                            {approvingUserIds.has(user.id!) ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              <BadgeCheck className="h-4 w-4" />
                            )}
                            <span className="sr-only">Approve User</span>
                          </Button>
                        )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          router.push(
                            `/system/administration/users/view/${user.id}`
                          );
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      {haveEditAccess && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            router.push(
                              `/system/administration/users/edit/${user.id}`
                            );
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
