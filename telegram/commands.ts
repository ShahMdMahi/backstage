import TelegramBot from "node-telegram-bot-api";
import dedent from "dedent";
import { format, addHours } from "date-fns";
import {
  getAllSuspendedUsersForBot,
  getAllUnapprovedUsersForBot,
  getAllUnverifiedUsersForBot,
  getUserAllUsersForBot,
  getUserByEmailForBot,
  getUserByIdForBot,
} from "./user";

function escapeMarkdownV2(value: unknown): string {
  return String(value).replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

function code(value: unknown): string {
  return `\`${escapeMarkdownV2(value)}\``;
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
  /users_unverified - Get all unverified users
  /users_unapproved - Get all unapproved users
  /users_suspended - Get all suspended users
  /user_email - Get user details by email address
  /user_id - Get user details by user ID
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
  /users_unverified - Get all unverified users
  /users_unapproved - Get all unapproved users
  /users_suspended - Get all suspended users
  /user_email - Get user details by email address
  /user_id - Get user details by user ID
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

          let message = escapeMarkdownV2(
            "An error occurred while fetching user data."
          );
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

                message += `${i + 1}\\. *${escapeMarkdownV2(user.name)}*\n`;
                message += `   *ID:* ${code(user.id)}\n`;
                message += `   *Email:* ${code(user.email)}\n`;
                message += `   *Role:* ${escapeMarkdownV2(user.role?.replace(/_/g, " ").replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()))}\n`;
                message += `   *Verified At:* ${escapeMarkdownV2(verified)}\n`;
                message += `   *Approved At:* ${escapeMarkdownV2(approved)}\n`;
                message += `   *Suspended At:* ${escapeMarkdownV2(suspended)}\n`;
                message += `   *Created At:* ${escapeMarkdownV2(created)}\n`;
                message += `   *Updated At:* ${escapeMarkdownV2(updated)}\n\n`;
              }
            }
          } catch (error) {
            console.error("Error fetching users:", error);
          }
          try {
            await bot.sendMessage(chatId, message, {
              parse_mode: "MarkdownV2",
            });
          } catch (error) {
            console.error("Error sending message:", error);
          }
        })()
      );
    }
  });

  // /Register /users_unverified - Get all unverified users
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
            if (!msg.text) return;

            let message = escapeMarkdownV2(
              "An error occurred while fetching unverified user data."
            );
            try {
              const data = await getAllUnverifiedUsersForBot();

              if (!data.success) {
                message = "Failed to retrieve unverified users.";
                return;
              }

              const users = data.users;

              message = `📋 Total unverified users: ${users.length}\n\n`;

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
                    addHours(user.createdAt!, 6),
                    "dd/MM/yyyy HH:mm:ss"
                  );
                  const updated = format(
                    addHours(user.updatedAt!, 6),
                    "dd/MM/yyyy HH:mm:ss"
                  );

                  message += `${i + 1}\\. *${escapeMarkdownV2(user.name)}*\n`;
                  message += `   *ID:* ${code(user.id)}\n`;
                  message += `   *Email:* ${code(user.email)}\n`;
                  message += `   *Role:* ${escapeMarkdownV2(user.role?.replace(/_/g, " ").replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()))}\n`;
                  message += `   *Verified At:* ${escapeMarkdownV2(verified)}\n`;
                  message += `   *Approved At:* ${escapeMarkdownV2(approved)}\n`;
                  message += `   *Suspended At:* ${escapeMarkdownV2(suspended)}\n`;
                  message += `   *Created At:* ${escapeMarkdownV2(created)}\n`;
                  message += `   *Updated At:* ${escapeMarkdownV2(updated)}\n\n`;
                }
              }
            } catch (error) {
              console.error("Error fetching unverified users:", error);
            }
            try {
              await bot.sendMessage(chatId, message, {
                parse_mode: "MarkdownV2",
              });
            } catch (error) {
              console.error("Error sending message:", error);
            }
          })()
        );
      }
    }
  );

  // /Register /users_unapproved - Get all suspended users
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
            if (!msg.text) return;

            let message = escapeMarkdownV2(
              "An error occurred while fetching unapproved user data."
            );
            try {
              const data = await getAllUnapprovedUsersForBot();

              if (!data.success) {
                message = "Failed to retrieve unapproved users.";
                return;
              }

              const users = data.users;

              message = `📋 Total unapproved users: ${users.length}\n\n`;

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
                    addHours(user.createdAt!, 6),
                    "dd/MM/yyyy HH:mm:ss"
                  );
                  const updated = format(
                    addHours(user.updatedAt!, 6),
                    "dd/MM/yyyy HH:mm:ss"
                  );

                  message += `${i + 1}\\. *${escapeMarkdownV2(user.name)}*\n`;
                  message += `   *ID:* ${code(user.id)}\n`;
                  message += `   *Email:* ${code(user.email)}\n`;
                  message += `   *Role:* ${escapeMarkdownV2(user.role?.replace(/_/g, " ").replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()))}\n`;
                  message += `   *Verified At:* ${escapeMarkdownV2(verified)}\n`;
                  message += `   *Approved At:* ${escapeMarkdownV2(approved)}\n`;
                  message += `   *Suspended At:* ${escapeMarkdownV2(suspended)}\n`;
                  message += `   *Created At:* ${escapeMarkdownV2(created)}\n`;
                  message += `   *Updated At:* ${escapeMarkdownV2(updated)}\n\n`;
                }
              }
            } catch (error) {
              console.error("Error fetching unapproved users:", error);
            }
            try {
              await bot.sendMessage(chatId, message, {
                parse_mode: "MarkdownV2",
              });
            } catch (error) {
              console.error("Error sending message:", error);
            }
          })()
        );
      }
    }
  );

  // /Register /users_suspended - Get all suspended users
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
            if (!msg.text) return;

            let message = escapeMarkdownV2(
              "An error occurred while fetching suspended user data."
            );
            try {
              const data = await getAllSuspendedUsersForBot();

              if (!data.success) {
                message = "Failed to retrieve suspended users.";
                return;
              }

              const users = data.users;

              message = `📋 Total suspended users: ${users.length}\n\n`;

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
                    addHours(user.createdAt!, 6),
                    "dd/MM/yyyy HH:mm:ss"
                  );
                  const updated = format(
                    addHours(user.updatedAt!, 6),
                    "dd/MM/yyyy HH:mm:ss"
                  );

                  message += `${i + 1}\\. *${escapeMarkdownV2(user.name)}*\n`;
                  message += `   *ID:* ${code(user.id)}\n`;
                  message += `   *Email:* ${code(user.email)}\n`;
                  message += `   *Role:* ${escapeMarkdownV2(user.role?.replace(/_/g, " ").replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()))}\n`;
                  message += `   *Verified At:* ${escapeMarkdownV2(verified)}\n`;
                  message += `   *Approved At:* ${escapeMarkdownV2(approved)}\n`;
                  message += `   *Suspended At:* ${escapeMarkdownV2(suspended)}\n`;
                  message += `   *Created At:* ${escapeMarkdownV2(created)}\n`;
                  message += `   *Updated At:* ${escapeMarkdownV2(updated)}\n\n`;
                }
              }
            } catch (error) {
              console.error("Error fetching suspended users:", error);
            }
            try {
              await bot.sendMessage(chatId, message, {
                parse_mode: "MarkdownV2",
              });
            } catch (error) {
              console.error("Error sending message:", error);
            }
          })()
        );
      }
    }
  );

  // /Register /user_email - Get user by email
  bot.onText(
    new RegExp(`^\\/user_email(?:@${botUsername})?$`, "i"),
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
            if (!msg.text) return;

            let message = escapeMarkdownV2(
              "An error occurred while fetching user data."
            );
            const prompt = await bot.sendMessage(
              chatId,
              "Please enter the email address of the user you want to look up:",
              {
                reply_markup: {
                  force_reply: true,
                  input_field_placeholder: "example@email.com",
                },
              }
            );
            console.log(
              "Prompt sent for /user_email, message_id:",
              prompt.message_id
            );

            bot.onReplyToMessage(chatId, prompt.message_id, async (reply) => {
              console.log("Reply received for /user_email:", reply.text);
              const email = reply.text?.trim();
              if (!email) {
                message = "No email address provided.";
                await bot.sendMessage(chatId, message);
                return;
              }

              if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                message = "Invalid email address format. Please try again.";
                await bot.sendMessage(chatId, message);
                return;
              }

              let user;
              try {
                console.log("Fetching user by email for bot:", email);
                const data = await getUserByEmailForBot(email);

                if (!data.success || !data.user) {
                  message = `No user found with the email address ${escapeMarkdownV2(
                    email
                  )}.`;
                  await bot.sendMessage(chatId, message, {
                    parse_mode: "MarkdownV2",
                  });
                  return;
                }

                user = data.user;
                console.log("User data for bot by email", user);
                message = `📋 User details for ${code(user.email)}`;

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

                message += `\n*Name:* ${escapeMarkdownV2(user.name)}`;
                message += `\n*ID:* ${code(user.id)}`;
                message += `\n*Email:* ${code(user.email)}`;
                message += `\n*Role:* ${escapeMarkdownV2(user.role?.replace(/_/g, " ").replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()))}`;
                message += `\n*Verified At:* ${escapeMarkdownV2(verified)}`;
                message += `\n*Approved At:* ${escapeMarkdownV2(approved)}`;
                message += `\n*Suspended At:* ${escapeMarkdownV2(suspended)}`;
                message += `\n*Created At:* ${escapeMarkdownV2(created)}`;
                message += `\n*Updated At:* ${escapeMarkdownV2(updated)}`;

                try {
                  console.log("Sending user details with action buttons");
                  await bot.sendMessage(chatId, message, {
                    parse_mode: "MarkdownV2",
                    reply_markup: {
                      inline_keyboard: [
                        [
                          user?.verifiedAt
                            ? {
                                text: user?.approvedAt
                                  ? "Unapprove User"
                                  : "Approve User",
                                callback_data: user?.approvedAt
                                  ? `unapprove_user_${user.id}`
                                  : `approve_user_${user.id}`,
                              }
                            : {
                                text: "Resend Verification Email",
                                callback_data: `resend_verification_${user.id}`,
                              },
                          {
                            text: user?.suspendedAt
                              ? "Unsuspend User"
                              : "Suspend User",
                            callback_data: user?.suspendedAt
                              ? `unsuspend_user_${user.id}`
                              : `suspend_user_${user.id}`,
                          },
                        ],
                        [{ text: "Cancel", callback_data: "cancel_action" }],
                      ],
                    },
                  });
                } catch (error) {
                  console.error("Error sending message:", error);
                }
                return;
              } catch (error) {
                console.error("Error fetching user by email:", error);
                message = "An error occurred while fetching user data.";
                await bot.sendMessage(chatId, message);
                return;
              }
            });
          })()
        );
      }
    }
  );

  // /Register /user_id - Get user by ID
  bot.onText(
    new RegExp(`^\\/user_id(?:@${botUsername})?$`, "i"),
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
            if (!msg.text) return;

            let message = escapeMarkdownV2(
              "An error occurred while fetching user data."
            );
            const prompt = await bot.sendMessage(
              chatId,
              "Please enter the ID of the user you want to look up:",
              {
                reply_markup: {
                  force_reply: true,
                  input_field_placeholder: "user ID",
                },
              }
            );
            console.log(
              "Prompt sent for /user_id, message_id:",
              prompt.message_id
            );

            bot.onReplyToMessage(chatId, prompt.message_id, async (reply) => {
              console.log("Reply received for /user_id:", reply.text);
              const id = reply.text?.trim();
              if (!id) {
                message = "No ID provided.";
                await bot.sendMessage(chatId, message);
                return;
              }

              let user;
              try {
                console.log("Fetching user by ID for bot:", id);
                const data = await getUserByIdForBot(id);
                if (!data.success || !data.user) {
                  message = `No user found with the ID ${escapeMarkdownV2(
                    id
                  )}.`;
                  await bot.sendMessage(chatId, message, {
                    parse_mode: "MarkdownV2",
                  });
                  return;
                }

                user = data.user;
                console.log("User data for bot by ID", user);
                message = `📋 User details for ${code(user.id)}`;

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

                message += `\n*Name:* ${escapeMarkdownV2(user.name)}`;
                message += `\n*ID:* ${code(user.id)}`;
                message += `\n*Email:* ${code(user.email)}`;
                message += `\n*Role:* ${escapeMarkdownV2(user.role?.replace(/_/g, " ").replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()))}`;
                message += `\n*Verified At:* ${escapeMarkdownV2(verified)}`;
                message += `\n*Approved At:* ${escapeMarkdownV2(approved)}`;
                message += `\n*Suspended At:* ${escapeMarkdownV2(suspended)}`;
                message += `\n*Created At:* ${escapeMarkdownV2(created)}`;
                message += `\n*Updated At:* ${escapeMarkdownV2(updated)}`;

                try {
                  console.log("Sending user details with action buttons");
                  await bot.sendMessage(chatId, message, {
                    parse_mode: "MarkdownV2",
                    reply_markup: {
                      inline_keyboard: [
                        [
                          user?.verifiedAt
                            ? {
                                text: user?.approvedAt
                                  ? "Unapprove User"
                                  : "Approve User",
                                callback_data: user?.approvedAt
                                  ? `unapprove_user_${user.id}`
                                  : `approve_user_${user.id}`,
                              }
                            : {
                                text: "Resend Verification Email",
                                callback_data: `resend_verification_${user.id}`,
                              },
                          {
                            text: user?.suspendedAt
                              ? "Unsuspend User"
                              : "Suspend User",
                            callback_data: user?.suspendedAt
                              ? `unsuspend_user_${user.id}`
                              : `suspend_user_${user.id}`,
                          },
                        ],
                        [{ text: "Cancel", callback_data: "cancel_action" }],
                      ],
                    },
                  });
                } catch (error) {
                  console.error("Error sending message:", error);
                }
                return;
              } catch (error) {
                console.error("Error fetching user by ID:", error);
                message = "An error occurred while fetching user data.";
                await bot.sendMessage(chatId, message);
                return;
              }
            });
          })()
        );
      }
    }
  );
}
