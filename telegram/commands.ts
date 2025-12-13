import TelegramBot from "node-telegram-bot-api";
import dedent from "dedent";
import { format, addHours } from "date-fns";
import { getUserAllUsersForBot } from "@/actions/user";

export function registerCommands(
  bot: TelegramBot,
  groupId: string,
  botUsername: string
) {
  // /Register /start - Start interaction with the bot
  bot.onText(new RegExp(`^\\/start(?:@${botUsername})?$`, "i"), async (msg) => {
    if (global.pendingPromises) {
      global.pendingPromises.push(
        (async () => {
          const chatId = msg.chat.id;
          if (chatId.toString() !== groupId) {
            try {
              await bot.sendMessage(chatId, "Unauthorized chat.");
            } catch (error) {
              console.error("Error sending unauthorized message:", error);
            }
            return;
          }
          try {
            await bot.sendMessage(
              chatId,
              dedent`
  Hello! I'm your RoyalMotionIT Record Label Dashboard's Telegram bot.
  Here are some commands you can use:
  /start - Start interaction with the bot
  /status - Check if the bot is online
  /help - Show this help message
  /info - Get information about this bot
  /users - Get all registered users
`
            );
          } catch (error) {
            console.error("Error sending message:", error);
          }
        })()
      );
    }
  });

  // /Register /status - Check if the bot is online
  bot.onText(
    new RegExp(`^\\/status(?:@${botUsername})?$`, "i"),
    async (msg) => {
      if (global.pendingPromises) {
        global.pendingPromises.push(
          (async () => {
            const chatId = msg.chat.id;
            if (chatId.toString() !== groupId) {
              try {
                await bot.sendMessage(chatId, "Unauthorized chat.");
              } catch (error) {
                console.error("Error sending unauthorized message:", error);
              }
              return;
            }
            try {
              await bot.sendMessage(
                chatId,
                "✅ The bot is online and running."
              );
            } catch (error) {
              console.error("Error sending message:", error);
            }
          })()
        );
      }
    }
  );

  // /Register /help - Show this help message
  bot.onText(new RegExp(`^\\/help(?:@${botUsername})?$`, "i"), async (msg) => {
    if (global.pendingPromises) {
      global.pendingPromises.push(
        (async () => {
          const chatId = msg.chat.id;
          if (chatId.toString() !== groupId) {
            try {
              await bot.sendMessage(chatId, "Unauthorized chat.");
            } catch (error) {
              console.error("Error sending unauthorized message:", error);
            }
            return;
          }
          try {
            await bot.sendMessage(
              chatId,
              dedent`
  Available commands:
  /start - Start interaction with the bot
  /status - Check if the bot is online
  /help - Show this help message
  /info - Get information about this bot
  /users - Get all registered users
`
            );
          } catch (error) {
            console.error("Error sending message:", error);
          }
        })()
      );
    }
  });

  // /Register /info - Get information about this bot
  bot.onText(new RegExp(`^\\/info(?:@${botUsername})?$`, "i"), async (msg) => {
    if (global.pendingPromises) {
      global.pendingPromises.push(
        (async () => {
          const chatId = msg.chat.id;
          if (chatId.toString() !== groupId) {
            try {
              await bot.sendMessage(chatId, "Unauthorized chat.");
            } catch (error) {
              console.error("Error sending unauthorized message:", error);
            }
            return;
          }
          try {
            await bot.sendMessage(
              chatId,
              "🤖 I'm the RoyalMotionIT Record Label Dashboard Telegram bot, here to assist you with notifications and updates and actions from your dashboard application."
            );
          } catch (error) {
            console.error("Error sending message:", error);
          }
        })()
      );
    }
  });

  // /Register /users - Get all registered users
  bot.onText(new RegExp(`^\\/users(?:@${botUsername})?$`, "i"), async (msg) => {
    if (global.pendingPromises) {
      global.pendingPromises.push(
        (async () => {
          const chatId = msg.chat.id;
          if (chatId.toString() !== groupId) {
            try {
              await bot.sendMessage(chatId, "Unauthorized chat.");
            } catch (error) {
              console.error("Error sending unauthorized message:", error);
            }
            return;
          }
          if (!msg.text) return;

          let message = "An error occurred while fetching user data.";
          try {
            const data = await getUserAllUsersForBot();

            if (!data.success) {
              message = "Failed to retrieve users.";
              return;
            }

            const users = data.users;

            message = `📋 Total users: ${users.length}\n\n`;

            if (users.length > 0) {
              for (let i = 0; i < users.length; i++) {
                const user = users[i];
                const verified = user.verifiedAt
                  ? format(addHours(user.verifiedAt, 6), "dd/MM/yyyy HH:mm:ss")
                  : "N/A";
                const approved = user.approvedAt
                  ? format(addHours(user.approvedAt, 6), "dd/MM/yyyy HH:mm:ss")
                  : "N/A";
                const suspended = user.suspendedAt
                  ? format(addHours(user.suspendedAt, 6), "dd/MM/yyyy HH:mm:ss")
                  : "N/A";
                const created = format(
                  addHours(user.createdAt!, 6),
                  "dd/MM/yyyy HH:mm:ss"
                );
                const updated = format(
                  addHours(user.updatedAt!, 6),
                  "dd/MM/yyyy HH:mm:ss"
                );

                message += `${i + 1}. **${user.name}**\n`;
                message += `   **ID:** \`${user.id}\`\n`;
                message += `   **Email:** \`${user.email}\`\n`;
                message += `   **Role:** ${user.role}\n`;
                message += `   **Verified At:** ${verified}\n`;
                message += `   **Approved At:** ${approved}\n`;
                message += `   **Suspended At:** ${suspended}\n`;
                message += `   **Created At:** ${created}\n`;
                message += `   **Updated At:** ${updated}\n\n`;
              }
            }
          } catch (error) {
            console.error("Error fetching users:", error);
          }
          try {
            await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
          } catch (error) {
            console.error("Error sending message:", error);
          }
        })()
      );
    }
  });
}
