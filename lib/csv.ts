import "server-only";
import { createHash } from "crypto";

export function getCSVHash(csvContent: string): string {
  return createHash("sha256").update(csvContent).digest("hex");
}
