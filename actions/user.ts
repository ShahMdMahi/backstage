"use server";

import { prisma } from "@/lib/prisma";
import { User } from "@/lib/prisma/client";

export async function getUserAllUsersForBot(): Promise<{
  success: boolean;
  users: Partial<User>[] | [];
}> {
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

    if (users.length < 0) {
      return { success: false, users: [] };
    }

    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users for bot:", error);
    return { success: false, users: [] };
  }
}
