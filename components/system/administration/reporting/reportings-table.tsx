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
import { Eye, Search } from "lucide-react";
import { Reporting, User } from "@/lib/prisma/browser";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  REPORTING_TYPE,
  REPORTING_CURRENCY,
  REPORTING_DELIMITER,
  ROLE,
} from "@/lib/prisma/enums";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface ReportingsTableProps {
  reportings: (Partial<Reporting> & {
    uploader: Partial<User> | null;
    processor: Partial<User> | null;
  })[];
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

function formatReportingType(type: REPORTING_TYPE): string {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatCurrency(currency: REPORTING_CURRENCY): string {
  return currency.toUpperCase();
}

function formatDelimiter(delimiter: REPORTING_DELIMITER): string {
  switch (delimiter) {
    case REPORTING_DELIMITER.COMMA:
      return "Comma (,)";
    case REPORTING_DELIMITER.SEMICOLON:
      return "Semicolon (;)";
    default:
      return delimiter;
  }
}

export default function ReportingsTable({ reportings }: ReportingsTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReportings = useMemo(() => {
    if (!searchQuery.trim()) return reportings;

    const query = searchQuery.toLowerCase();
    return reportings.filter((reporting) => {
      return (
        reporting.id?.toLowerCase().includes(query) ||
        reporting.name?.toLowerCase().includes(query) ||
        reporting.type?.toLowerCase().includes(query) ||
        reporting.currency?.toLowerCase().includes(query) ||
        reporting.delimiter?.toLowerCase().includes(query) ||
        reporting.hash?.toLowerCase().includes(query) ||
        reporting.uploader?.id?.toLowerCase().includes(query) ||
        reporting.uploader?.email?.toLowerCase().includes(query) ||
        reporting.uploader?.name?.toLowerCase().includes(query) ||
        reporting.uploader?.phone?.toLowerCase().includes(query) ||
        reporting.processor?.id?.toLowerCase().includes(query) ||
        reporting.processor?.email?.toLowerCase().includes(query) ||
        reporting.processor?.name?.toLowerCase().includes(query) ||
        reporting.processor?.phone?.toLowerCase().includes(query)
      );
    });
  }, [reportings, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by ID, name, type, currency, delimiter, hash, uploader, or processor..."
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
              <TableHead>Name</TableHead>
              <TableHead>Reporting Month</TableHead>
              <TableHead>Uploader</TableHead>
              <TableHead>Processor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Net Revenue</TableHead>
              <TableHead>Delimiter</TableHead>
              <TableHead>Hash</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-hidden">
            {filteredReportings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center h-24">
                  {searchQuery.trim()
                    ? "No reportings found matching your search."
                    : "No reportings found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredReportings.map((reporting) => (
                <TableRow
                  key={reporting.id}
                  className="odd:bg-muted/50 *:whitespace-nowrap"
                >
                  <TableCell className="pl-4 font-mono text-xs">
                    {reporting.id}
                  </TableCell>
                  <TableCell className="max-w-48">
                    <div className="truncate" title={reporting.name}>
                      {reporting.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-sm">
                        {
                          formatDateAndTime(reporting.reportingMonth || null)
                            .date
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {
                          formatDateAndTime(reporting.reportingMonth || null)
                            .time
                        }
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {reporting.uploader ? (
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={reporting.uploader.avatar || undefined}
                              alt={reporting.uploader.name || ""}
                            />
                            <AvatarFallback>
                              {getInitials(reporting.uploader.name)}
                            </AvatarFallback>
                          </Avatar>
                          <Badge
                            variant={
                              reporting.uploader.role === ROLE.SYSTEM_OWNER
                                ? "destructive"
                                : reporting.uploader.role === ROLE.SYSTEM_ADMIN
                                  ? "default"
                                  : reporting.uploader.role === ROLE.SYSTEM_USER
                                    ? "secondary"
                                    : "outline"
                            }
                            className="w-fit text-xs text-center"
                          >
                            <div className="flex flex-col leading-tight">
                              {reporting.uploader.role
                                ?.split("_")
                                .map((word, i) => (
                                  <span key={i}>{formatRole(word)}</span>
                                ))}
                            </div>
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">
                            {reporting.uploader.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {reporting.uploader.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {reporting.uploader.phone || "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {reporting.uploader.id}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground italic">
                        Not available
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {reporting.processor ? (
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={reporting.processor.avatar || undefined}
                              alt={reporting.processor.name || ""}
                            />
                            <AvatarFallback>
                              {getInitials(reporting.processor.name)}
                            </AvatarFallback>
                          </Avatar>
                          <Badge
                            variant={
                              reporting.processor.role === ROLE.SYSTEM_OWNER
                                ? "destructive"
                                : reporting.processor.role === ROLE.SYSTEM_ADMIN
                                  ? "default"
                                  : reporting.processor.role ===
                                      ROLE.SYSTEM_USER
                                    ? "secondary"
                                    : "outline"
                            }
                            className="w-fit text-xs text-center"
                          >
                            <div className="flex flex-col leading-tight">
                              {reporting.processor.role
                                ?.split("_")
                                .map((word, i) => (
                                  <span key={i}>{formatRole(word)}</span>
                                ))}
                            </div>
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">
                            {reporting.processor.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {reporting.processor.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {reporting.processor.phone || "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {reporting.processor.id}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground italic">
                        Not processed
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {formatReportingType(reporting.type!)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {formatCurrency(reporting.currency!)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {reporting.netRevenue !== undefined
                      ? reporting.netRevenue.toFixed(2)
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {formatDelimiter(reporting.delimiter!)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs max-w-32">
                    <div className="truncate" title={reporting.hash}>
                      {reporting.hash}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-sm">
                        {formatDateAndTime(reporting.createdAt || null).date}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateAndTime(reporting.createdAt || null).time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-sm">
                        {formatDateAndTime(reporting.updatedAt || null).date}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateAndTime(reporting.updatedAt || null).time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                              onClick={() =>
                                router.push(
                                  `/system/administration/reporting/${reporting.id}`
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Reporting</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
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
