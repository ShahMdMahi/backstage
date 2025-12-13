import TelegramBot from "node-telegram-bot-api";
import { NextRequest, NextResponse } from "next/server";
import { commandListener } from "@/actions/telegram";

// The bot instance needs to be outside the POST function so listeners persist across calls
const token = process.env.TELEGRAM_BOT_TOKEN!;
// Set up the bot for webhooks (no polling option here)
const bot = new TelegramBot(token);

// Register your message listeners here:
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  await commandListener(
    chatId,
    msg.text?.split(" ")[0].substring(1) || "",
    msg.text?.split(" ").slice(1) || []
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
