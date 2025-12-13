import TelegramBot from "node-telegram-bot-api";
import dedent from "dedent";
import { prisma } from "@/lib/prisma";
import { format, addHours } from "date-fns";

const userStates = new Map<number, string>();

async function processUserById(
  bot: TelegramBot,
  chatId: number,
  groupId: string,
  id: string
) {
  if (chatId.toString() !== groupId) {
    try {
      await bot.sendMessage(chatId, "Unauthorized chat.");
    } catch (error) {
      console.error("Error sending unauthorized message:", error);
    }
    return;
  }
  let message = "An error occurred while fetching user data.";
  try {
    const users = await prisma.user.findMany({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verifiedAt: true,
        approvedAt: true,
        suspendedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    message = `📋 User with ID: ${id}\n\n`;

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
          addHours(user.createdAt, 6),
          "dd/MM/yyyy HH:mm:ss"
        );
        const updated = format(
          addHours(user.updatedAt, 6),
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
    } else {
      message += "No user found with that ID.";
    }
  } catch (error) {
    console.error("Error fetching user:", error);
  }
  try {
    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

async function processUserByEmail(
  bot: TelegramBot,
  chatId: number,
  groupId: string,
  email: string
) {
  if (chatId.toString() !== groupId) {
    try {
      await bot.sendMessage(chatId, "Unauthorized chat.");
    } catch (error) {
      console.error("Error sending unauthorized message:", error);
    }
    return;
  }
  let message = "An error occurred while fetching user data.";
  try {
    const users = await prisma.user.findMany({
      where: {
        email: email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verifiedAt: true,
        approvedAt: true,
        suspendedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    message = `📋 User with Email: ${email}\n\n`;

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
          addHours(user.createdAt, 6),
          "dd/MM/yyyy HH:mm:ss"
        );
        const updated = format(
          addHours(user.updatedAt, 6),
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
    } else {
      message += "No user found with that email.";
    }
  } catch (error) {
    console.error("Error fetching user:", error);
  }
  try {
    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

export function registerCommands(
  bot: TelegramBot,
  groupId: string,
  botUsername: string
) {
  // /Register /start - Start interaction with the bot
  bot.onText(new RegExp(`^\\/start(?:@${botUsername})?$`, "i"), async (msg) => {
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
  /users_unverified - Get unverified users
  /users_unapproved - Get unapproved users
  /users_suspended - Get suspended users
  /users_id - Get user by ID (will prompt for ID)
  /users_email - Get user by email (will prompt for email)
`
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // /Register /status - Check if the bot is online
  bot.onText(
    new RegExp(`^\\/status(?:@${botUsername})?$`, "i"),
    async (msg) => {
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
        await bot.sendMessage(chatId, "✅ The bot is online and running.");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  );

  // /Register /help - Show this help message
  bot.onText(new RegExp(`^\\/help(?:@${botUsername})?$`, "i"), async (msg) => {
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
  /users_unverified - Get unverified users
  /users_unapproved - Get unapproved users
  /users_suspended - Get suspended users
  /users_id - Get user by ID (will prompt for ID)
  /users_email - Get user by email (will prompt for email)
`
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // /Register /info - Get information about this bot
  bot.onText(new RegExp(`^\\/info(?:@${botUsername})?$`, "i"), async (msg) => {
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
  });

  // /Register /users - Get all registered users
  bot.onText(new RegExp(`^\\/users(?:@${botUsername})?$`, "i"), async (msg) => {
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
    const args = msg.text.split(" ").slice(1);
    const whereClause: {
      id?: string;
      email?: string;
      verifiedAt?: null;
      approvedAt?: null;
    } = {};
    let title = "Total Registered Users";

    if (args.length > 0) {
      const filter = args[0].toLowerCase();
      if (filter === "unverified") {
        whereClause.verifiedAt = null;
        title = "Unverified Users";
      } else if (filter === "unapproved") {
        whereClause.approvedAt = null;
        title = "Unapproved Users";
      } else if (filter === "id" && args[1]) {
        whereClause.id = args[1];
        title = `User with ID: ${args[1]}`;
      } else if (filter === "email" && args[1]) {
        whereClause.email = args[1];
        title = `User with Email: ${args[1]}`;
      } else {
        await bot.sendMessage(
          chatId,
          "Invalid /users command. Use /help for available options.",
          { parse_mode: "Markdown" }
        );
        return;
      }
    }

    let message = "An error occurred while fetching user data.";
    try {
      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          verifiedAt: true,
          approvedAt: true,
          suspendedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      message = `📋 ${title}: ${users.length}\n\n`;

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
            addHours(user.createdAt, 6),
            "dd/MM/yyyy HH:mm:ss"
          );
          const updated = format(
            addHours(user.updatedAt, 6),
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
  });

  // /Register /users_unverified - Get unverified users
  bot.onText(
    new RegExp(`^\\/users_unverified(?:@${botUsername})?$`, "i"),
    async (msg) => {
      const chatId = msg.chat.id;
      if (chatId.toString() !== groupId) {
        try {
          await bot.sendMessage(chatId, "Unauthorized chat.");
        } catch (error) {
          console.error("Error sending unauthorized message:", error);
        }
        return;
      }
      let message = "An error occurred while fetching user data.";
      try {
        const users = await prisma.user.findMany({
          where: {
            verifiedAt: null,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            verifiedAt: true,
            approvedAt: true,
            suspendedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        message = `📋 Unverified Users: ${users.length}\n\n`;

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
              addHours(user.createdAt, 6),
              "dd/MM/yyyy HH:mm:ss"
            );
            const updated = format(
              addHours(user.updatedAt, 6),
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
    }
  );

  // /Register /users_unapproved - Get unapproved users
  bot.onText(
    new RegExp(`^\\/users_unapproved(?:@${botUsername})?$`, "i"),
    async (msg) => {
      const chatId = msg.chat.id;
      if (chatId.toString() !== groupId) {
        try {
          await bot.sendMessage(chatId, "Unauthorized chat.");
        } catch (error) {
          console.error("Error sending unauthorized message:", error);
        }
        return;
      }
      let message = "An error occurred while fetching user data.";
      try {
        const users = await prisma.user.findMany({
          where: {
            approvedAt: null,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            verifiedAt: true,
            approvedAt: true,
            suspendedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        message = `📋 Unapproved Users: ${users.length}\n\n`;

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
              addHours(user.createdAt, 6),
              "dd/MM/yyyy HH:mm:ss"
            );
            const updated = format(
              addHours(user.updatedAt, 6),
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
    }
  );

  // /Register /users_suspended - Get suspended users
  bot.onText(
    new RegExp(`^\\/users_suspended(?:@${botUsername})?$`, "i"),
    async (msg) => {
      const chatId = msg.chat.id;
      if (chatId.toString() !== groupId) {
        try {
          await bot.sendMessage(chatId, "Unauthorized chat.");
        } catch (error) {
          console.error("Error sending unauthorized message:", error);
        }
        return;
      }
      let message = "An error occurred while fetching user data.";
      try {
        const users = await prisma.user.findMany({
          where: {
            suspendedAt: {
              not: null,
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            verifiedAt: true,
            approvedAt: true,
            suspendedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        message = `📋 Suspended Users: ${users.length}\n\n`;

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
              addHours(user.createdAt, 6),
              "dd/MM/yyyy HH:mm:ss"
            );
            const updated = format(
              addHours(user.updatedAt, 6),
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
    }
  );

  // /Register /users_id - Get user by ID
  bot.onText(
    new RegExp(`^\\/users_id(?:@${botUsername})?$`, "i"),
    async (msg) => {
      const chatId = msg.chat.id;
      if (chatId.toString() !== groupId) {
        try {
          await bot.sendMessage(chatId, "Unauthorized chat.");
        } catch (error) {
          console.error("Error sending unauthorized message:", error);
        }
        return;
      }
      const userId = msg.from?.id;
      if (userId) {
        userStates.set(userId, "waiting_for_id");
        await bot.sendMessage(chatId, "Please enter the user ID:");
      }
    }
  );

  // /Register /users_email - Get user by email
  bot.onText(
    new RegExp(`^\\/users_email(?:@${botUsername})?$`, "i"),
    async (msg) => {
      const chatId = msg.chat.id;
      if (chatId.toString() !== groupId) {
        try {
          await bot.sendMessage(chatId, "Unauthorized chat.");
        } catch (error) {
          console.error("Error sending unauthorized message:", error);
        }
        return;
      }
      const userId = msg.from?.id;
      if (userId) {
        userStates.set(userId, "waiting_for_email");
        await bot.sendMessage(chatId, "Please enter the user email:");
      }
    }
  );

  // Handle user inputs for ID and email
  bot.on("message", (msg) => {
    const userId = msg.from?.id;
    if (!userId) return;
    const state = userStates.get(userId);
    if (state && msg.text && !msg.text.startsWith("/")) {
      if (state === "waiting_for_id") {
        const id = msg.text.trim();
        userStates.delete(userId);
        // Process ID
        processUserById(bot, msg.chat.id, groupId, id);
      } else if (state === "waiting_for_email") {
        const email = msg.text.trim();
        userStates.delete(userId);
        // Process email
        processUserByEmail(bot, msg.chat.id, groupId, email);
      }
    }
  });
}
