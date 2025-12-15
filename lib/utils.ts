import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function getInitials(name: string) {
  if (!name) return "";
  const words = name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase());
  if (words.length === 0) return "";
  if (words.length === 1) return words[0] ?? "";
  return (words[0] ?? "") + (words[words.length - 1] ?? "");
}
