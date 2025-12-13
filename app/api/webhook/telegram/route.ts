import TelegramBot from "node-telegram-bot-api";
import { NextRequest, NextResponse } from "next/server";
import dedent from "dedent";

// The bot instance needs to be outside the POST function so listeners persist across calls
const token = process.env.TELEGRAM_BOT_TOKEN!;
const groupId = process.env.TELEGRAM_GROUP_ID!;
const botUsername = process.env.TELEGRAM_BOT_USERNAME!;
// Set up the bot for webhooks (no polling option here)
const bot = new TelegramBot(token);

// Register your message listeners here:
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  if (chatId.toString() !== groupId) {
    bot.sendMessage(chatId, "Unauthorized chat.");
    return;
  }

  const text = msg.text || "";

  // Use the 'text' property to check for commands, but you can also use Telegram's entities to detect commands more robustly
  if (msg.entities) {
    const commandEntity = msg.entities.find((e) => e.type === "bot_command");
    if (commandEntity) {
      const command = text.slice(
        commandEntity.offset,
        commandEntity.offset + commandEntity.length
      );
      // Normalize command for easier matching (strip bot username if present)
      const normalizedCommand = command.replace(
        new RegExp(`@${botUsername}$`, "i"),
        ""
      );

      switch (normalizedCommand) {
        case "/start":
          bot.sendMessage(
            chatId,
            dedent`
          Hello! I'm your RoyalMotionIT Record Label Dashboard's Telegram bot.
          Here are some commands you can use:
          /status - Check if the bot is online
          /help - Get a list of commands
          /info - Get information about this bot
        `
          );
          break;
        case "/status":
          bot.sendMessage(chatId, "✅ The bot is online and running.");
          break;
        case "/help":
          bot.sendMessage(
            chatId,
            dedent`
          Available commands:
          /start - Start interaction with the bot
          /status - Check if the bot is online
          /help - Show this help message
          /info - Get information about this bot
        `
          );
          break;
        case "/info":
          bot.sendMessage(
            chatId,
            "🤖 I'm the RoyalMotionIT Record Label Dashboard Telegram bot, here to assist you with notifications and updates and actions from your dashboard application."
          );
          break;
        default:
          bot.sendMessage(
            chatId,
            "Sorry, I didn't understand that command. Type /help for assistance."
          );
      }
      return;
    }
  }
  // If no command entity, fallback to default message
  bot.sendMessage(
    chatId,
    "Sorry, I didn't understand that command. Type /help for assistance."
  );
});

// The POST handler receives updates from Telegram
export async function POST(req: NextRequest) {
  const body = await req.json(); // Parse the JSON body from Telegram
  bot.processUpdate(body); // Process the update using the library's method

  // Must return a 200 status quickly to confirm receipt to Telegram
  return NextResponse.json({ status: "OK" });
}

// A GET handler is useful for initial setup or verification
export async function GET() {
  return NextResponse.json({ status: "Bot webhook endpoint ready." });
}
