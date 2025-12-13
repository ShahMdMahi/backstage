"use server";

import { telegramBot } from "@/lib/telegram";
import { AuditLog, User } from "@/lib/prisma/client";
import dedent from "dedent";

const telegramGroupId = process.env.TELEGRAM_GROUP_ID!;

export async function sendFormattedAuditLog(
  auditLog: AuditLog & { user: User | null }
): Promise<void> {
  try {
    const message = dedent`
🔔 **Audit Log Alert**

**Action:** \`${auditLog.action}\`
**Entity:** \`${auditLog.entity}\`
**User:** ${auditLog.user ? `${auditLog.user.name} (${auditLog.user.email})` : "System"}
**Description:** ${auditLog.description || "N/A"}
**Entity ID:** \`${auditLog.entityId}\`
**Time:** ${auditLog.createdAt.toLocaleString()}

${auditLog.metadata ? `**Metadata:**\n\`\`\`json\n${JSON.stringify(auditLog.metadata, null, 2)}\n\`\`\`` : ""}
    `.trim();

    await telegramBot.sendMessage(telegramGroupId, message, {
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Failed to send formatted audit log:", error);
  }
}
