"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { formatInTimeZone } from "date-fns-tz";
import { DeviceInfo } from "@/lib/device-info";
import {
  MonitorIcon,
  MapPinIcon,
  GlobeIcon,
  FingerprintIcon,
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  description: string | null;
  createdAt: Date;
  metadata: unknown;
}

interface AuditLogsTabsProps {
  auditLogs: AuditLog[];
}

// Format date in Bangladesh timezone
function formatDateTime(date: Date | null | undefined): {
  date: string;
  time: string;
} {
  if (!date) return { date: "N/A", time: "" };
  const dateStr = formatInTimeZone(date, "Asia/Dhaka", "dd/MM/yyyy");
  const timeStr = formatInTimeZone(date, "Asia/Dhaka", "hh:mm:ss a");
  return { date: dateStr, time: timeStr };
}

// Format entity name for display
function formatEntityName(entity: string): string {
  return entity
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function AuditLogsTabs({ auditLogs }: AuditLogsTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("ALL");

  // Get unique entities from the audit logs
  const entities = Array.from(new Set(auditLogs.map((log) => log.entity)));

  // Filter logs based on active tab
  const filteredLogs =
    activeTab === "ALL"
      ? auditLogs
      : auditLogs.filter((log) => log.entity === activeTab);

  // Get count for each entity
  const getEntityCount = (entity: string) => {
    if (entity === "ALL") return auditLogs.length;
    return auditLogs.filter((log) => log.entity === entity).length;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4 flex-wrap h-auto">
        <TabsTrigger value="ALL" className="gap-2">
          All
          <Badge variant="secondary" className="ml-1">
            {getEntityCount("ALL")}
          </Badge>
        </TabsTrigger>
        {entities.map((entity) => (
          <TabsTrigger key={entity} value={entity} className="gap-2">
            {formatEntityName(entity)}
            <Badge variant="secondary" className="ml-1">
              {getEntityCount(entity)}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={activeTab} className="mt-0">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No audit logs found for this category.
            </p>
          ) : (
            filteredLogs.map((log) => {
              // Parse device info from metadata
              const metadata = log.metadata as {
                deviceInfo?: string;
              } | null;

              let deviceInfo: DeviceInfo | null = null;
              try {
                if (metadata?.deviceInfo) {
                  deviceInfo = JSON.parse(metadata.deviceInfo) as DeviceInfo;
                }
              } catch (error) {
                console.error("Failed to parse device info:", error);
              }

              return (
                <div key={log.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="default" className="text-xs">
                      {formatAction(log.action)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {formatEntityName(log.entity)}
                    </Badge>
                  </div>

                  {log.description && (
                    <p className="text-sm">{log.description}</p>
                  )}

                  {deviceInfo && (
                    <>
                      <Separator className="my-2" />
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {/* Device Name */}
                        {deviceInfo.deviceName && (
                          <div className="flex items-center gap-1.5">
                            <MonitorIcon className="size-3" />
                            <span>
                              {deviceInfo.deviceName}
                              {deviceInfo.deviceBrand &&
                                ` (${deviceInfo.deviceBrand}`}
                              {deviceInfo.deviceModel &&
                                ` ${deviceInfo.deviceModel}`}
                              {(deviceInfo.deviceBrand ||
                                deviceInfo.deviceModel) &&
                                ")"}
                            </span>
                          </div>
                        )}

                        {/* IP Address */}
                        {deviceInfo.ipAddress && (
                          <div className="flex items-center gap-1.5">
                            <GlobeIcon className="size-3" />
                            <span>{deviceInfo.ipAddress}</span>
                          </div>
                        )}

                        {/* Location */}
                        {deviceInfo.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPinIcon className="size-3" />
                            <span>
                              {[
                                deviceInfo.location.city,
                                deviceInfo.location.region,
                                deviceInfo.location.country,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                              {deviceInfo.location.isp &&
                                ` (${deviceInfo.location.isp})`}
                            </span>
                          </div>
                        )}

                        {/* Fingerprint */}
                        {deviceInfo.deviceFingerprint && (
                          <div className="flex items-center gap-1.5">
                            <FingerprintIcon className="size-3" />
                            <span className="font-mono">
                              {deviceInfo.deviceFingerprint}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    <span>
                      {formatDateTime(log.createdAt).date}{" "}
                      {formatDateTime(log.createdAt).time}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
