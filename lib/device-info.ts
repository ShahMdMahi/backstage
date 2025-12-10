"use server";

import { UAParser } from "ua-parser-js";
import { headers } from "next/headers";
import { SESSION_DEVICE_TYPE } from "./prisma/client";
import crypto from "crypto";

export interface DeviceInfo {
  ipAddress: string;
  userAgent: string;
  deviceType: SESSION_DEVICE_TYPE;
  deviceName: string;
  deviceBrand: string;
  deviceModel: string;
  deviceFingerprint: string;
  location: {
    city: string | null;
    region: string | null;
    country: string | null;
    isp: string | null;
  } | null;
}

export interface DeviceInfoWithFingerprint extends DeviceInfo {
  clientFingerprint?: string;
}

interface IPApiResponse {
  status: string;
  country?: string;
  regionName?: string;
  city?: string;
  isp?: string;
  query?: string;
}

/**
 * Get device information from the request headers in a server action.
 * This function extracts IP address, user agent, device details, and location.
 * @param clientFingerprint - Optional client-side generated fingerprint for consistent device identification
 */
export async function getDeviceInfo(
  clientFingerprint?: string
): Promise<DeviceInfo> {
  const headersList = await headers();

  // Get IP address from headers
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const ipAddress = forwardedFor?.split(",")[0].trim() || realIp || "127.0.0.1";

  // Get user agent
  const userAgent = headersList.get("user-agent") || "Unknown";

  // Parse user agent
  const parser = new UAParser();
  parser.setUA(userAgent);
  const device = parser.getDevice();
  const os = parser.getOS();
  const browser = parser.getBrowser();

  // Determine device type
  const deviceType = mapDeviceType(device.type);

  // Get device details
  const deviceBrand = device.vendor || "Unknown";
  const deviceModel = device.model || "Unknown";
  const deviceName = `${browser.name || "Unknown"} on ${os.name || "Unknown"}`;

  // Use client fingerprint if provided, otherwise generate from server-side data
  const fingerprint =
    clientFingerprint || generateFingerprint(ipAddress, userAgent);

  // Get location from IP
  const location = await getDetailedLocationInfo(ipAddress);

  return {
    ipAddress,
    userAgent,
    deviceType,
    deviceName,
    deviceBrand,
    deviceModel,
    deviceFingerprint: fingerprint,
    location,
  };
}

/**
 * Map UAParser device type to SESSION_DEVICE_TYPE enum
 */
function mapDeviceType(deviceType: string | undefined): SESSION_DEVICE_TYPE {
  if (!deviceType) return SESSION_DEVICE_TYPE.DESKTOP;

  const type = deviceType.toLowerCase();

  switch (type) {
    case "mobile":
      return SESSION_DEVICE_TYPE.MOBILE;
    case "tablet":
      return SESSION_DEVICE_TYPE.TABLET;
    case "smarttv":
    case "wearable":
    case "embedded":
      return SESSION_DEVICE_TYPE.OTHER;
    default:
      return SESSION_DEVICE_TYPE.DESKTOP;
  }
}

/**
 * Generate a fallback device fingerprint from stable device characteristics
 * Uses SHA-256 hash of user agent for deterministic fingerprinting
 * Note: This is a fallback. Client-side fingerprint (via FingerprintJS) is more reliable
 */
function generateFingerprint(ip: string, userAgent: string): string {
  // Create deterministic hash from stable characteristics
  // Note: User agent is the most stable identifier from server-side
  const hash = crypto.createHash("sha256").update(userAgent).digest("hex");

  // Return first 32 characters for consistency with your database field
  return hash.substring(0, 32);
}

/**
 * Get detailed location info including ISP
 */
export async function getDetailedLocationInfo(ip: string): Promise<{
  city: string | null;
  region: string | null;
  country: string | null;
  isp: string | null;
} | null> {
  // Skip for localhost/private IPs
  if (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.")
  ) {
    return {
      city: "Local",
      region: "Local",
      country: "Local",
      isp: "Local Network",
    };
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data: IPApiResponse = await response.json();

    if (data.status === "success") {
      return {
        city: data.city || null,
        region: data.regionName || null,
        country: data.country || null,
        isp: data.isp || null,
      };
    }

    return null;
  } catch (error) {
    console.error("Failed to get detailed location info:", error);
    return null;
  }
}
