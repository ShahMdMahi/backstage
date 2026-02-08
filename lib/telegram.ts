import { env } from "@/env";
import TelegramBot from "node-telegram-bot-api";

const globalForTelegram = globalThis as unknown as {
  telegramBot: TelegramBot | undefined;
};

export const telegramBot =
  globalForTelegram.telegramBot ??
  new TelegramBot(env.TELEGRAM_BOT_TOKEN!, { polling: false });

if (env.NODE_ENV !== "production") globalForTelegram.telegramBot = telegramBot;
