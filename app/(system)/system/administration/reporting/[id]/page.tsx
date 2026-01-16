import { logout } from "@/actions/auth/auth";
import { getCurrentSession } from "@/actions/shared/session";
import { REPORTING_SYSTEM_ACCESS_LEVEL, ROLE } from "@/lib/prisma/enums";
import { redirect } from "next/navigation";
import { getReportingById } from "@/actions/system/reporting";
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
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { formatInTimeZone } from "date-fns-tz";
import {
  FileTextIcon,
  HashIcon,
  MailIcon,
  PhoneIcon,
  XCircleIcon,
  UserIcon,
  UserCogIcon,
  CalendarIcon,
  DollarSignIcon,
  TagIcon,
  CogIcon,
} from "lucide-react";
import { euroToUsd, usdToEuro } from "@/actions/shared/currency-exchange";
import { DeleteReportingButton } from "@/components/system/administration/reporting/delete-reporting-button";

export const dynamic = "force-dynamic";

// Helper to format role display
function formatRole(role: string): string {
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

// Helper to format currency
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

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

  const reportingResult = await getReportingById(id);

  // Show custom not found message
  if (!reportingResult.success || !reportingResult.data) {
    return (
      <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
        <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
          {/* Page Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 sm:size-12">
              <FileTextIcon className="size-5 text-primary sm:size-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Reporting Details
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                View and analyze system reports
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
                Reporting Not Found
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-1">
                The reporting you are looking for does not exist or has been
                removed.
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

  const reporting = reportingResult.data;
  const uploader = reporting.uploader;
  const processor = reporting.processor;

  // Check if user can delete the reporting
  const canDelete =
    session.data.user.role === ROLE.SYSTEM_OWNER ||
    session.data.user.role === ROLE.SYSTEM_ADMIN ||
    (session.data.user.role === ROLE.SYSTEM_USER &&
      session.data.user.systemAccess?.reportingAccessLevel.includes(
        REPORTING_SYSTEM_ACCESS_LEVEL.DELETE
      ));

  // Check if user can process the reporting
  const canProcess =
    session.data.user.role === ROLE.SYSTEM_OWNER ||
    session.data.user.role === ROLE.SYSTEM_ADMIN ||
    (session.data.user.role === ROLE.SYSTEM_USER &&
      session.data.user.systemAccess?.reportingAccessLevel.includes(
        REPORTING_SYSTEM_ACCESS_LEVEL.PROCESS
      ));

  // Get currency conversions
  const netRevenue = reporting.netRevenue;
  const currency = reporting.currency;
  let usdAmount = netRevenue;
  let eurAmount = netRevenue;

  if (currency === "USD") {
    const eurResult = await usdToEuro(netRevenue, new Date());
    eurAmount = eurResult.success ? eurResult.euro : netRevenue;
  } else if (currency === "EUR") {
    const usdResult = await euroToUsd(netRevenue, new Date());
    usdAmount = usdResult.success ? usdResult.usd : netRevenue;
  }

  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 sm:size-12">
              <FileTextIcon className="size-5 text-primary sm:size-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Reporting Details
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                View and analyze system reports
              </p>
            </div>
          </div>
          {canDelete && (
            <div className="flex items-center gap-2">
              <DeleteReportingButton
                reportingId={reporting.id!}
                reportingName={reporting.name!}
              />
            </div>
          )}
        </div>

        {/* Reporting Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="size-5" />
              Reporting Information
            </CardTitle>
            <CardDescription>
              General information about this reporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Reporting Summary */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex size-16 items-center justify-center rounded-lg bg-primary/10">
                  <FileTextIcon className="size-8 text-primary" />
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="mt-1">
                    {reporting.type}
                  </Badge>
                </div>
              </div>

              {/* Reporting Details */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <HashIcon className="size-3" /> Reporting ID
                  </p>
                  <p className="font-mono text-sm break-all">{reporting.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <TagIcon className="size-3" /> Name
                  </p>
                  <p className="font-medium">{reporting.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <HashIcon className="size-3" /> Hash
                  </p>
                  <p className="font-mono text-sm break-all">
                    {reporting.hash}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="size-3" /> Reporting Month
                  </p>
                  <p className="font-medium">
                    {formatInTimeZone(
                      reporting.reportingMonth,
                      "Asia/Dhaka",
                      "dd MMM yyyy"
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <TagIcon className="size-3" /> Delimiter
                  </p>
                  <Badge variant="outline">{reporting.delimiter}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <DollarSignIcon className="size-3" /> Currency
                  </p>
                  <Badge variant="outline">{reporting.currency}</Badge>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Revenue & Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSignIcon className="size-3" /> Net Revenue (USD)
                </p>
                <p className="font-medium text-green-600">
                  {formatCurrency(usdAmount, "USD")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSignIcon className="size-3" /> Net Revenue (EUR)
                </p>
                <p className="font-medium text-green-600">
                  {formatCurrency(eurAmount, "EUR")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="size-3" /> Created At
                </p>
                <div>
                  <p className="text-sm">
                    {formatInTimeZone(
                      reporting.createdAt,
                      "Asia/Dhaka",
                      "dd/MM/yyyy"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatInTimeZone(
                      reporting.createdAt,
                      "Asia/Dhaka",
                      "hh:mm:ss a"
                    )}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="size-3" /> Updated At
                </p>
                <div>
                  <p className="text-sm">
                    {formatInTimeZone(
                      reporting.updatedAt,
                      "Asia/Dhaka",
                      "dd/MM/yyyy"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatInTimeZone(
                      reporting.updatedAt,
                      "Asia/Dhaka",
                      "hh:mm:ss a"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CogIcon className="size-5" />
              Processing
            </CardTitle>
            <CardDescription>
              Processing status and information for this reporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Processing Summary */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`flex size-16 items-center justify-center rounded-lg ${
                    reporting.processedAt
                      ? "bg-green-100 text-green-600"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  <CogIcon className="size-8" />
                </div>
                <div className="text-center">
                  <Badge
                    variant={reporting.processedAt ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {reporting.processedAt ? "Processed" : "Pending"}
                  </Badge>
                </div>
              </div>

              {/* Processing Details */}
              <div className="flex-1 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileTextIcon className="size-3" /> Total Reports
                    </p>
                    <p className="font-medium text-lg">
                      {reporting.reports ? reporting.reports.length : 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <CalendarIcon className="size-3" /> Processed At
                    </p>
                    <div>
                      {reporting.processedAt ? (
                        <>
                          <p className="text-sm font-medium">
                            {formatInTimeZone(
                              reporting.processedAt,
                              "Asia/Dhaka",
                              "dd/MM/yyyy"
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatInTimeZone(
                              reporting.processedAt,
                              "Asia/Dhaka",
                              "hh:mm:ss a"
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Not processed yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Process Button */}
                {canProcess && !reporting.processedAt && (
                  <div className="pt-2">
                    <Button className="w-full sm:w-auto sm:min-w-32">
                      <CogIcon className="size-4 mr-2" />
                      Process Reports
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uploader and Processor Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Uploader Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="size-5" />
                Uploaded By
              </CardTitle>
              <CardDescription>
                The user who uploaded this reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploader ? (
                <div className="flex items-start gap-4">
                  <Avatar className="size-16 border-2 border-border">
                    <AvatarImage
                      src={uploader.avatar || undefined}
                      alt={uploader.name}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(uploader.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="text-lg font-semibold">{uploader.name}</h3>
                      <Badge variant="outline" className="mt-1">
                        {formatRole(uploader.role || "")}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <HashIcon className="size-3.5" />
                        <span className="font-mono text-xs break-all">
                          {uploader.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MailIcon className="size-3.5 text-muted-foreground" />
                        <span>{uploader.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <PhoneIcon className="size-3.5 text-muted-foreground" />
                        <span>{uploader.phone || "No phone number"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
                    <UserIcon className="size-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    No Uploader Information
                  </h3>
                  <p className="text-xs text-muted-foreground text-center">
                    The uploader information is not available for this
                    reporting.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processor Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCogIcon className="size-5" />
                Processed By
              </CardTitle>
              <CardDescription>
                The user who processed this reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processor ? (
                <div className="flex items-start gap-4">
                  <Avatar className="size-16 border-2 border-border">
                    <AvatarImage
                      src={processor.avatar || undefined}
                      alt={processor.name}
                    />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                      {getInitials(processor.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {processor.name}
                      </h3>
                      <Badge variant="outline" className="mt-1">
                        {formatRole(processor.role || "")}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <HashIcon className="size-3.5" />
                        <span className="font-mono text-xs break-all">
                          {processor.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MailIcon className="size-3.5 text-muted-foreground" />
                        <span>{processor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <PhoneIcon className="size-3.5 text-muted-foreground" />
                        <span>{processor.phone || "No phone number"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
                    <UserCogIcon className="size-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    No Processor Information
                  </h3>
                  <p className="text-xs text-muted-foreground text-center">
                    The processor information is not available for this
                    reporting.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
