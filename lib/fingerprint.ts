"use client";

import FingerprintJS, { Agent } from "@fingerprintjs/fingerprintjs";

let fpPromise: Promise<Agent> | null = null;

/**
 * Initialize FingerprintJS agent (singleton pattern)
 */
function getFingerprintAgent() {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }
  return fpPromise;
}

/**
 * Generate a stable device fingerprint on the client-side
 * This fingerprint remains consistent even after browser updates
 * @returns A unique device fingerprint string
 */
export async function generateClientFingerprint(): Promise<string> {
  try {
    const fp = await getFingerprintAgent();
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error("Failed to generate fingerprint:", error);
    // Fallback to a timestamp-based ID if fingerprinting fails
    return `fallback_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

/**
 * Get or create device fingerprint from localStorage
 * This ensures consistent fingerprint across page reloads
 * @returns The device fingerprint
 */
export async function getDeviceFingerprint(): Promise<string> {
  const STORAGE_KEY = "device_fingerprint";

  // Check if we already have a stored fingerprint
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return stored;
  }

  // Generate new fingerprint
  const fingerprint = await generateClientFingerprint();

  // Store it for future use
  localStorage.setItem(STORAGE_KEY, fingerprint);

  return fingerprint;
}
