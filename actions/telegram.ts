"use server";

import { telegramBot } from "@/lib/telegram";
import { AuditLog, User } from "@/lib/prisma/client";
import dedent from "dedent";

const telegramGroupId = process.env.TELEGRAM_GROUP_ID!;

/**
 * Define a type for a generic object with string keys, used for type assertion
 * on metadata to satisfy the TypeScript compiler during iteration.
 */
type StringKeyedObject = { [key: string]: unknown };

/**
 * Escapes characters reserved by Telegram's MarkdownV2 in a string.
 * Reserved characters: _, *, [, ], (, ), ~, `, >, #, +, -, =, |, {, }, ., !
 */
function escapeMarkdownV2(text: string): string {
  // Replace all reserved characters with their escaped version (\char).
  return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1");
}

/**
 * Manually removes backslashes that were used to escape quotes/special chars
 * inside a JSON string that came from the database.
 * e.g., '{\"ipAddress\"...}' becomes '{"ipAddress"...}'
 */
function deEscapeString(text: string): string {
  // Replace all occurrences of an escaped quote (\\") with a regular quote (")
  return text.replace(/\\"/g, '"');
}

export async function sendFormattedAuditLog(
  auditLog: AuditLog & { user: User | null }
): Promise<void> {
  try {
    // 1. Escape basic fields for MarkdownV2
    const action = escapeMarkdownV2(auditLog.action);
    const entity = escapeMarkdownV2(auditLog.entity);
    const description = escapeMarkdownV2(auditLog.description || "N/A");
    const entityId = escapeMarkdownV2(auditLog.entityId);
    const time = escapeMarkdownV2(auditLog.createdAt.toLocaleString());

    // --- User Details ---
    let userDetails: string;

    if (auditLog.user) {
      const userName = escapeMarkdownV2(auditLog.user.name);
      const userEmailContent = escapeMarkdownV2(auditLog.user.email);

      // Escape the literal parentheses characters
      userDetails = `${userName} \\(${userEmailContent}\\)`;
    } else {
      userDetails = "System";
    }

    // --- Metadata Fix (Handling Any JSON Content) ---
    let metadataBlock: string;

    if (auditLog.metadata) {
      let metadataObject = auditLog.metadata;

      // Step 1: Attempt to parse the metadata if it's currently a string.
      if (typeof metadataObject === "string") {
        try {
          metadataObject = JSON.parse(metadataObject);
        } catch (e) {
          console.error("Failed to parse top-level metadata string.", e);
        }
      }

      // Step 2: Traverse and fix nested JSON strings only if metadataObject is an actual object (not array/null)
      if (
        typeof metadataObject === "object" &&
        metadataObject !== null &&
        !Array.isArray(metadataObject)
      ) {
        // Assertion: Treat the object as one with string keys for safe iteration
        const jsonObject = metadataObject as StringKeyedObject;

        for (const key in jsonObject) {
          if (
            typeof jsonObject[key] === "string" &&
            jsonObject[key].startsWith("{")
          ) {
            const cleanedString = deEscapeString(jsonObject[key]);
            try {
              // Attempt to parse the cleaned string into a proper object
              jsonObject[key] = JSON.parse(cleanedString);
            } catch (e) {
              // Keep the value as the original string if parsing fails
              console.error(`Failed to parse nested JSON for key '${key}'.`, e);
            }
          }
        }

        // Step 3: Stringify the fully parsed/cleaned object for clean, formatted display.
        const jsonString = JSON.stringify(jsonObject, null, 2);

        metadataBlock = dedent`
            *Metadata:*
            \`\`\`json
            ${jsonString}
            \`\`\`
          `;
      } else {
        // If it's an array or some other final structure, just stringify it directly
        const jsonString = JSON.stringify(metadataObject, null, 2);

        metadataBlock = dedent`
            *Metadata:*
            \`\`\`json
            ${jsonString}
            \`\`\`
          `;
      }
    } else {
      metadataBlock = "";
    }
    // ----------------------------------------------------

    // 2. Construct the final message string
    const message = dedent`
      🔔 *Audit Log Alert*

      *Action:* \`${action}\`
      *Entity:* \`${entity}\`
      *User:* ${userDetails}
      *Description:* ${description}
      *Entity ID:* \`${entityId}\`
      *Time:* ${time}

      ${metadataBlock}
    `.trim();

    // 3. Send the message with MarkdownV2 parse mode
    await telegramBot.sendMessage(telegramGroupId, message, {
      parse_mode: "MarkdownV2",
    });
  } catch (error) {
    console.error("Failed to send formatted audit log:", error);
  }
}
