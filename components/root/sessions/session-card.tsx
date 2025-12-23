import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DeviceIcon } from "./device-icon";
import { SessionActions } from "./session-action";
import { formatRelativeTime } from "@/lib/utils";
import { MapPinIcon, GlobeIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { Session } from "@/lib/prisma/client";
import { DeviceInfo } from "@/lib/device-info";
import { formatInTimeZone } from "date-fns-tz";

interface SessionCardProps {
  session: Session;
  currentSession: Session;
  onSessionUpdate?: (sessionId: string, revokedAt: Date) => void;
  onSessionDelete?: (sessionId: string) => void;
}

export function isSessionRevoked(session: Session): boolean {
  return session.revokedAt !== null;
}

export function isSessionExpired(session: Session): boolean {
  return session.expiresAt < new Date();
}

export function isSessionActive(session: Session): boolean {
  return !isSessionRevoked(session) && !isSessionExpired(session);
}

export function getSessionStatus(
  session: Session
): "active" | "revoked" | "expired" {
  if (isSessionRevoked(session)) return "revoked";
  if (isSessionExpired(session)) return "expired";
  return "active";
}

export function SessionCard({
  session,
  currentSession,
  onSessionUpdate,
  onSessionDelete,
}: SessionCardProps) {
  const status = getSessionStatus(session);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "revoked":
        return "secondary";
      case "expired":
        return "destructive";
      default:
        return "outline";
    }
  };

  const metadata = session.metadata as {
    deviceInfo: string & Record<string, unknown>;
    revokedReason?: string;
  };
  const deviceInfo = metadata
    ? (JSON.parse(metadata.deviceInfo) as DeviceInfo)
    : null;

  const revokedReason = metadata?.revokedReason;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
              <DeviceIcon deviceType={session.deviceType} className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-base truncate">
                  {deviceInfo?.deviceName || "Unknown Device"}
                </h3>
                {session.id === currentSession.id && (
                  <Badge variant="default" className="shrink-0">
                    Current
                  </Badge>
                )}
                <Badge variant={getStatusColor(status)} className="shrink-0">
                  {status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {deviceInfo?.deviceBrand || "Unknown Brand"}{" "}
                {deviceInfo?.deviceModel || "Unknown Model"}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <GlobeIcon className="size-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground truncate">
              {session.ipAddress}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPinIcon className="size-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground truncate">
              {deviceInfo?.location?.city || "Unknown City"},{" "}
              {deviceInfo?.location?.region || "Unknown Region"},{" "}
              {deviceInfo?.location?.country || "Unknown Country"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ClockIcon className="size-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">
              Last active{" "}
              {session.accessedAt
                ? formatRelativeTime(session.accessedAt)
                : "never"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">
              {status === "expired" ? "Expired" : "Expires"}{" "}
              {formatInTimeZone(
                session.expiresAt,
                "Asia/Dhaka",
                "dd/MM/yyyy HH:mm a"
              )}
            </span>
          </div>
        </div>

        {/* Additional Metadata */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>ISP: {deviceInfo?.location?.isp || "Unknown ISP"}</p>
          <p className="truncate">Fingerprint: {session.deviceFingerprint}</p>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              Created:{" "}
              {formatInTimeZone(
                session.createdAt,
                "Asia/Dhaka",
                "dd/MM/yyyy HH:mm a"
              )}
            </p>
            {session.revokedAt && (
              <p>
                Revoke:{" "}
                {formatInTimeZone(
                  session.revokedAt,
                  "Asia/Dhaka",
                  "dd/MM/yyyy hh:mm a"
                )}
              </p>
            )}
            {revokedReason && <p>Reason: {revokedReason}</p>}
          </div>
          <SessionActions
            session={session}
            currentSession={currentSession}
            onSessionUpdate={onSessionUpdate}
            onSessionDelete={onSessionDelete}
          />
        </div>
      </div>
    </Card>
  );
}
