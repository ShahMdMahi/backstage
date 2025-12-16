import TelegramBot from "node-telegram-bot-api";
// import dedent from "dedent";
// import { format, addHours } from "date-fns";
import {
  approveUserByIdForBot,
  unapproveUserByIdForBot,
  suspendUserByIdForBot,
  unsuspendUserByIdForBot,
  resendVerificationEmailByIdForBot,
} from "./user";

function escapeMarkdownV2(value: unknown): string {
  return String(value).replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

function code(value: unknown): string {
  return `\`${escapeMarkdownV2(value)}\``;
}

export function registerQueryCallbacks(bot: TelegramBot, groupId: string) {
  bot.on("callback_query", async (query) => {
    if (global.pendingPromises) {
      global.pendingPromises.push(
        (async () => {
          const action = query.data;
          const msg = query.message;
          const chatId = msg?.chat.id;
          if (chatId?.toString() !== groupId) {
            try {
              await bot.sendMessage(chatId!, "Unauthorized chat.");
            } catch (error) {
              console.error("Error sending unauthorized message:", error);
            }
            return;
          }

          switch (action) {
            case action?.startsWith("approve_user_"):
              try {
                const id = action!.replace("approve_user_", "");
                const result = await approveUserByIdForBot(id);
                if (result.success && result.user) {
                  await bot.sendMessage(
                    chatId!,
                    `✅ Approved user ${code(result.user.id)} successfully.`,
                    { parse_mode: "MarkdownV2" }
                  );
                } else {
                  await bot.sendMessage(
                    chatId!,
                    `⚠️ User ${code(
                      id
                    )} could not be approved \(maybe already approved\)\.`,
                    { parse_mode: "MarkdownV2" }
                  );
                }
              } catch (error) {
                console.error("Error sending approve user message:", error);
              }
              break;
            case action?.startsWith("unapprove_user_"):
              try {
                const id = action!.replace("unapprove_user_", "");
                const result = await unapproveUserByIdForBot(id);
                if (result.success && result.user) {
                  await bot.sendMessage(
                    chatId!,
                    `✅ Unapproved user ${code(result.user.id)} successfully.`,
                    { parse_mode: "MarkdownV2" }
                  );
                } else {
                  await bot.sendMessage(
                    chatId!,
                    `⚠️ User ${code(
                      id
                    )} could not be unapproved \(maybe already unapproved\)\.`,
                    { parse_mode: "MarkdownV2" }
                  );
                }
              } catch (error) {
                console.error("Error sending unapprove user message:", error);
              }
              break;
            case action?.startsWith("suspend_user_"):
              try {
                const id = action!.replace("suspend_user_", "");
                const result = await suspendUserByIdForBot(id);
                if (result.success && result.user) {
                  await bot.sendMessage(
                    chatId!,
                    `✅ Suspended user ${code(result.user.id)} successfully.`,
                    { parse_mode: "MarkdownV2" }
                  );
                } else {
                  await bot.sendMessage(
                    chatId!,
                    `⚠️ User ${code(
                      id
                    )} could not be suspended \(maybe already suspended\)\.`,
                    { parse_mode: "MarkdownV2" }
                  );
                }
              } catch (error) {
                console.error("Error sending suspend user message:", error);
              }
              break;
            case action?.startsWith("unsuspend_user_"):
              try {
                const id = action!.replace("unsuspend_user_", "");
                const result = await unsuspendUserByIdForBot(id);
                if (result.success && result.user) {
                  await bot.sendMessage(
                    chatId!,
                    `✅ Unsuspended user ${code(result.user.id)} successfully.`,
                    { parse_mode: "MarkdownV2" }
                  );
                } else {
                  await bot.sendMessage(
                    chatId!,
                    `⚠️ User ${code(
                      id
                    )} could not be unsuspended \(maybe already unsuspended\)\.`,
                    { parse_mode: "MarkdownV2" }
                  );
                }
              } catch (error) {
                console.error("Error sending unsuspend user message:", error);
              }
              break;
            case action?.startsWith("resend_verification_"):
              try {
                const id = action!.replace("resend_verification_", "");
                const result = await resendVerificationEmailByIdForBot(id);
                if (result.success && result.user) {
                  await bot.sendMessage(
                    chatId!,
                    `✅ Resent verification email for user ${code(
                      result.user.id
                    )} successfully.`,
                    { parse_mode: "MarkdownV2" }
                  );
                } else {
                  await bot.sendMessage(
                    chatId!,
                    `⚠️ Verification email for user ${code(
                      id
                    )} could not be resent.`,
                    { parse_mode: "MarkdownV2" }
                  );
                }
              } catch (error) {
                console.error(
                  "Error sending resend verification message:",
                  error
                );
              }
              break;
            case action?.includes("cancel_action"):
              try {
                await bot.sendMessage(chatId!, "Action cancelled.", {
                  parse_mode: "MarkdownV2",
                });
              } catch (error) {
                console.error("Error sending cancel action message:", error);
              }
              break;
            default:
              try {
                await bot.sendMessage(
                  chatId!,
                  `Unknown action: ${code(action)}.`,
                  { parse_mode: "MarkdownV2" }
                );
              } catch (error) {
                console.error("Error sending unknown action message:", error);
              }
              break;
          }
        })()
      );
    }
  });
}
