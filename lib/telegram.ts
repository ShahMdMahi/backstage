import TelegramBot from "node-telegram-bot-api";

const globalForTelegram = globalThis as unknown as {
  telegramBot: TelegramBot | undefined;
};

export const telegramBot =
  globalForTelegram.telegramBot ??
  new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });

if (process.env.NODE_ENV !== "production")
  globalForTelegram.telegramBot = telegramBot;
