"use server";

import { prisma } from "@/lib/prisma";

export async function getUserAllUsersForBot() {
  try {
    const users = await prisma.user.findMany({
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
    return users;
  } catch (error) {
    console.error("Error fetching users for bot:", error);
    throw error;
  }
}
