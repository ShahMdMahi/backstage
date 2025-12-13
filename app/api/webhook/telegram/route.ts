import TelegramBot from "node-telegram-bot-api";
import { NextRequest, NextResponse } from "next/server";
import { registerCommands } from "@/telegram/commands";

// The bot instance needs to be outside the POST function so listeners persist across calls
const token = process.env.TELEGRAM_BOT_TOKEN!;
const groupId = process.env.TELEGRAM_GROUP_ID!;
const botUsername = process.env.TELEGRAM_BOT_USERNAME!;
// Set up the bot for webhooks (no polling option here)
const bot = new TelegramBot(token);

registerCommands(bot, groupId, botUsername);

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

// Note: Make sure to set up the webhook URL with Telegram using the setWebhook method of the bot,
// pointing to this route's URL, so Telegram knows where to send updates.
// https://api.telegram.org/bot8370526122:AAE9D8QagGk9h_84_zeYXklML9e7dnmKglg/setWebhook?url=https://record-label-dashboard-v2.vercel.app/api/webhook/telegram
// https://api.telegram.org/bot8370526122:AAE9D8QagGk9h_84_zeYXklML9e7dnmKglg/getWebhookInfo
