"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Search } from "lucide-react";
import { SystemAccess, User } from "@/lib/prisma/browser";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ROLE } from "@/lib/prisma/enums";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface AccessesTableProps {
  accesses: (SystemAccess & { user: Partial<User>; assigner: Partial<User> })[];
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

export default function AccessesTable({ accesses }: AccessesTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAccesses = useMemo(() => {
    if (!searchQuery.trim()) return accesses;

    const query = searchQuery.toLowerCase();
    return accesses.filter((access) => {
      return (
        access.id.toLowerCase().includes(query) ||
        access.user.id?.toLowerCase().includes(query) ||
        access.user.email?.toLowerCase().includes(query) ||
        access.user.name?.toLowerCase().includes(query) ||
        access.user.phone?.toLowerCase().includes(query) ||
        access.user.role?.toLowerCase().includes(query) ||
        access.assigner.id?.toLowerCase().includes(query) ||
        access.assigner.email?.toLowerCase().includes(query) ||
        access.assigner.name?.toLowerCase().includes(query) ||
        access.assigner.phone?.toLowerCase().includes(query) ||
        access.assigner.role?.toLowerCase().includes(query)
      );
    });
  }, [accesses, searchQuery]);
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by access ID, user ID, email, phone, name, role, or assigner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="grid w-full [&>div]:max-h-[520px] [&>div]:border [&>div]:rounded">
        <Table>
          <TableHeader>
            <TableRow className="*:whitespace-nowrap sticky top-0 bg-background after:content-[''] after:inset-x-0 after:h-px after:bg-border after:absolute after:bottom-0">
              <TableHead className="pl-4">ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Assigner</TableHead>
              <TableHead>Assigned At</TableHead>
              <TableHead>Modified At</TableHead>
              <TableHead>Suspended At</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-hidden">
            {filteredAccesses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24">
                  {searchQuery.trim()
                    ? "No accesses found matching your search."
                    : "No system accesses found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredAccesses.map((access) => (
                <TableRow
                  key={access.id}
                  className="odd:bg-muted/50 *:whitespace-nowrap"
                >
                  <TableCell className="pl-4 font-mono text-xs">
                    {access.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={access.user.avatar || undefined}
                            alt={access.user.name || ""}
                          />
                          <AvatarFallback>
                            {getInitials(access.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <Badge
                          variant="outline"
                          className="w-fit text-xs text-center"
                        >
                          <div className="flex flex-col leading-tight">
                            {access.user.role?.split("_").map((word, i) => (
                              <span key={i}>{word}</span>
                            ))}
                          </div>
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="font-medium">{access.user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {access.user.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {access.user.phone || "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {access.user.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={access.assigner.avatar || undefined}
                            alt={access.assigner.name || ""}
                          />
                          <AvatarFallback>
                            {getInitials(access.assigner.name)}
                          </AvatarFallback>
                        </Avatar>
                        <Badge
                          variant={
                            access.assigner.role === ROLE.SYSTEM_OWNER
                              ? "destructive"
                              : "default"
                          }
                          className="w-fit text-xs text-center"
                        >
                          <div className="flex flex-col leading-tight">
                            {access.assigner.role?.split("_").map((word, i) => (
                              <span key={i}>{word}</span>
                            ))}
                          </div>
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="font-medium">
                          {access.assigner.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {access.assigner.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {access.assigner.phone || "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {access.assigner.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-sm">
                        {formatDateAndTime(access.createdAt).date}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateAndTime(access.createdAt).time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-sm">
                        {formatDateAndTime(access.updatedAt).date}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateAndTime(access.updatedAt).time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {access.suspendedAt ? (
                      <div className="flex flex-col gap-0.5">
                        <Badge variant="destructive" className="text-xs w-fit">
                          {formatDateAndTime(access.suspendedAt).date}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {formatDateAndTime(access.suspendedAt).time}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="default">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-sm">
                        {formatDateAndTime(access.expiresAt).date}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateAndTime(access.expiresAt).time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          router.push(
                            `/system/administration/accesses/${access.id}`
                          )
                        }
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          router.push(
                            `/system/administration/accesses/${access.id}/edit`
                          )
                        }
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
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
