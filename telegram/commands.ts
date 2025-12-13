import TelegramBot from "node-telegram-bot-api";
import dedent from "dedent";

export function registerCommands(
  bot: TelegramBot,
  groupId: string,
  botUsername: string
) {
  bot.onText(new RegExp(`^\\/start(?:@${botUsername})?$`, "i"), async (msg) => {
    const chatId = msg.chat.id;
    if (msg.chat.type !== "private" && chatId.toString() !== groupId) return;
    try {
      await bot.sendMessage(
        chatId,
        dedent`
  Hello! I'm your RoyalMotionIT Record Label Dashboard's Telegram bot.
  Here are some commands you can use:
  /status - Check if the bot is online
  /help - Get a list of commands
  /info - Get information about this bot
`
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  bot.onText(
    new RegExp(`^\\/status(?:@${botUsername})?$`, "i"),
    async (msg) => {
      const chatId = msg.chat.id;
      if (msg.chat.type !== "private" && chatId.toString() !== groupId) return;
      try {
        await bot.sendMessage(chatId, "✅ The bot is online and running.");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  );

  bot.onText(new RegExp(`^\\/help(?:@${botUsername})?$`, "i"), async (msg) => {
    const chatId = msg.chat.id;
    if (msg.chat.type !== "private" && chatId.toString() !== groupId) return;
    try {
      await bot.sendMessage(
        chatId,
        dedent`
  Available commands:
  /start - Start interaction with the bot
  /status - Check if the bot is online
  /help - Show this help message
  /info - Get information about this bot
`
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  bot.onText(new RegExp(`^\\/info(?:@${botUsername})?$`, "i"), async (msg) => {
    const chatId = msg.chat.id;
    if (msg.chat.type !== "private" && chatId.toString() !== groupId) return;
    try {
      await bot.sendMessage(
        chatId,
        "🤖 I'm the RoyalMotionIT Record Label Dashboard Telegram bot, here to assist you with notifications and updates and actions from your dashboard application."
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });
}
