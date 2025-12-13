import TelegramBot from "node-telegram-bot-api";
import dedent from "dedent";
import { prisma } from "@/lib/prisma";
import { format, addHours } from "date-fns";
import { getUserAllUsersForBot } from "@/actions/user";

const userStates = new Map<number, string>();

function escapeMarkdown(text: string): string {
  return text.replace(/([*_`\[\]])/g, "\\$1");
}

function escapeHTML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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

    message = `📋 User with ID: ${escapeMarkdown(id)}\n\n`;

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

        message += `${i + 1}. <b>${escapeHTML(user.name)}</b>\n`;
        message += `   <b>ID:</b> <code>${escapeHTML(user.id)}</code>\n`;
        message += `   <b>Email:</b> <code>${escapeHTML(user.email)}</code>\n`;
        message += `   <b>Role:</b> ${user.role}\n`;
        message += `   <b>Verified At:</b> ${verified}\n`;
        message += `   <b>Approved At:</b> ${approved}\n`;
        message += `   <b>Suspended At:</b> ${suspended}\n`;
        message += `   <b>Created At:</b> ${created}\n`;
        message += `   <b>Updated At:</b> ${updated}\n\n`;
      }
    } else {
      message += "No user found with that ID.";
    }
  } catch (error) {
    console.error("Error fetching user:", error);
  }
  try {
    await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
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

    message = `📋 User with Email: ${escapeMarkdown(email)}\n\n`;

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

        message += `${i + 1}. <b>${escapeHTML(user.name)}</b>\n`;
        message += `   <b>ID:</b> <code>${escapeHTML(user.id)}</code>\n`;
        message += `   <b>Email:</b> <code>${escapeHTML(user.email)}</code>\n`;
        message += `   <b>Role:</b> ${user.role}\n`;
        message += `   <b>Verified At:</b> ${verified}\n`;
        message += `   <b>Approved At:</b> ${approved}\n`;
        message += `   <b>Suspended At:</b> ${suspended}\n`;
        message += `   <b>Created At:</b> ${created}\n`;
        message += `   <b>Updated At:</b> ${updated}\n\n`;
      }
    } else {
      message += "No user found with that email.";
    }
  } catch (error) {
    console.error("Error fetching user:", error);
  }
  try {
    await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
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
            const users = await getUserAllUsersForBot();

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
            await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
          } catch (error) {
            console.error("Error sending message:", error);
          }
        })()
      );
    }
  });

  // /Register /users_unverified - Get unverified users
  bot.onText(
    new RegExp(`^\\/users_unverified(?:@${botUsername})?$`, "i"),
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
                    ? format(
                        addHours(user.verifiedAt, 6),
                        "dd/MM/yyyy HH:mm:ss"
                      )
                    : "N/A";
                  const approved = user.approvedAt
                    ? format(
                        addHours(user.approvedAt, 6),
                        "dd/MM/yyyy HH:mm:ss"
                      )
                    : "N/A";
                  const suspended = user.suspendedAt
                    ? format(
                        addHours(user.suspendedAt, 6),
                        "dd/MM/yyyy HH:mm:ss"
                      )
                    : "N/A";
                  const created = format(
                    addHours(user.createdAt, 6),
                    "dd/MM/yyyy HH:mm:ss"
                  );
                  const updated = format(
                    addHours(user.updatedAt, 6),
                    "dd/MM/yyyy HH:mm:ss"
                  );

                  message += `${i + 1}. <b>${escapeHTML(user.name)}</b>\n`;
                  message += `   <b>ID:</b> <code>${escapeHTML(user.id)}</code>\n`;
                  message += `   <b>Email:</b> <code>${escapeHTML(user.email)}</code>\n`;
                  message += `   <b>Role:</b> ${user.role}\n`;
                  message += `   <b>Verified At:</b> ${verified}\n`;
                  message += `   <b>Approved At:</b> ${approved}\n`;
                  message += `   <b>Suspended At:</b> ${suspended}\n`;
                  message += `   <b>Created At:</b> ${created}\n`;
                  message += `   <b>Updated At:</b> ${updated}\n\n`;
                }
              }
            } catch (error) {
              console.error("Error fetching users:", error);
            }
            try {
              await bot.sendMessage(chatId, message, {
                parse_mode: "HTML",
              });
            } catch (error) {
              console.error("Error sending message:", error);
            }
          })()
        );
      }
    }
  );

  // /Register /users_unapproved - Get unapproved users
  bot.onText(
    new RegExp(`^\\/users_unapproved(?:@${botUsername})?$`, "i"),
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
                    ? format(
                        addHours(user.verifiedAt, 6),
                        "dd/MM/yyyy HH:mm:ss"
                      )
                    : "N/A";
                  const approved = user.approvedAt
                    ? format(
                        addHours(user.approvedAt, 6),
                        "dd/MM/yyyy HH:mm:ss"
                      )
                    : "N/A";
                  const suspended = user.suspendedAt
                    ? format(
                        addHours(user.suspendedAt, 6),
                        "dd/MM/yyyy HH:mm:ss"
                      )
                    : "N/A";
                  const created = format(
                    addHours(user.createdAt, 6),
                    "dd/MM/yyyy HH:mm:ss"
                  );
                  const updated = format(
                    addHours(user.updatedAt, 6),
                    "dd/MM/yyyy HH:mm:ss"
                  );

                  message += `${i + 1}. <b>${escapeHTML(user.name)}</b>\n`;
                  message += `   <b>ID:</b> <code>${escapeHTML(user.id)}</code>\n`;
                  message += `   <b>Email:</b> <code>${escapeHTML(user.email)}</code>\n`;
                  message += `   <b>Role:</b> ${user.role}\n`;
                  message += `   <b>Verified At:</b> ${verified}\n`;
                  message += `   <b>Approved At:</b> ${approved}\n`;
                  message += `   <b>Suspended At:</b> ${suspended}\n`;
                  message += `   <b>Created At:</b> ${created}\n`;
                  message += `   <b>Updated At:</b> ${updated}\n\n`;
                }
              }
            } catch (error) {
              console.error("Error fetching users:", error);
            }
            try {
              await bot.sendMessage(chatId, message, {
                parse_mode: "HTML",
              });
            } catch (error) {
              console.error("Error sending message:", error);
            }
          })()
        );
      }
    }
  );

  // /Register /users_suspended - Get suspended users
  bot.onText(
    new RegExp(`^\\/users_suspended(?:@${botUsername})?$`, "i"),
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
                    ? format(
                        addHours(user.verifiedAt, 6),
                        "dd/MM/yyyy HH:mm:ss"
                      )
                    : "N/A";
                  const approved = user.approvedAt
                    ? format(
                        addHours(user.approvedAt, 6),
                        "dd/MM/yyyy HH:mm:ss"
                      )
                    : "N/A";
                  const suspended = user.suspendedAt
                    ? format(
                        addHours(user.suspendedAt, 6),
                        "dd/MM/yyyy HH:mm:ss"
                      )
                    : "N/A";
                  const created = format(
                    addHours(user.createdAt, 6),
                    "dd/MM/yyyy HH:mm:ss"
                  );
                  const updated = format(
                    addHours(user.updatedAt, 6),
                    "dd/MM/yyyy HH:mm:ss"
                  );

                  message += `${i + 1}. <b>${escapeHTML(user.name)}</b>\n`;
                  message += `   <b>ID:</b> <code>${escapeHTML(user.id)}</code>\n`;
                  message += `   <b>Email:</b> <code>${escapeHTML(user.email)}</code>\n`;
                  message += `   <b>Role:</b> ${user.role}\n`;
                  message += `   <b>Verified At:</b> ${verified}\n`;
                  message += `   <b>Approved At:</b> ${approved}\n`;
                  message += `   <b>Suspended At:</b> ${suspended}\n`;
                  message += `   <b>Created At:</b> ${created}\n`;
                  message += `   <b>Updated At:</b> ${updated}\n\n`;
                }
              }
            } catch (error) {
              console.error("Error fetching users:", error);
            }
            try {
              await bot.sendMessage(chatId, message, {
                parse_mode: "HTML",
              });
            } catch (error) {
              console.error("Error sending message:", error);
            }
          })()
        );
      }
    }
  );

  // /Register /users_id - Get user by ID
  bot.onText(
    new RegExp(`^\\/users_id(?:@${botUsername})?$`, "i"),
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
            const userId = msg.from?.id;
            if (userId) {
              userStates.set(userId, "waiting_for_id");
              await bot.sendMessage(chatId, "Please enter the user ID:");
            }
          })()
        );
      }
    }
  );

  // /Register /users_email - Get user by email
  bot.onText(
    new RegExp(`^\\/users_email(?:@${botUsername})?$`, "i"),
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
            const userId = msg.from?.id;
            if (userId) {
              userStates.set(userId, "waiting_for_email");
              await bot.sendMessage(chatId, "Please enter the user email:");
            }
          })()
        );
      }
    }
  );

  // Handle user inputs for ID and email
  bot.on("message", (msg) => {
    if (global.pendingPromises) {
      global.pendingPromises.push(
        (async () => {
          const userId = msg.from?.id;
          if (!userId) return;
          const state = userStates.get(userId);
          if (state && msg.text && !msg.text.startsWith("/")) {
            if (state === "waiting_for_id") {
              const id = msg.text.trim();
              userStates.delete(userId);
              // Process ID
              await processUserById(bot, msg.chat.id, groupId, id);
            } else if (state === "waiting_for_email") {
              const email = msg.text.trim();
              userStates.delete(userId);
              // Process email
              await processUserByEmail(bot, msg.chat.id, groupId, email);
            }
          }
        })()
      );
    }
  });
}
