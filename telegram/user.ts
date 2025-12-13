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

export async function getAllUnverifiedUsersForBot(): Promise<{
  success: boolean;
  users: Partial<User>[] | [];
}> {
  try {
    const users = await prisma.user.findMany({
      where: { verifiedAt: null },
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
    console.error("Error fetching unverified users for bot:", error);
    return { success: false, users: [] };
  }
}

export async function getAllUnapprovedUsersForBot(): Promise<{
  success: boolean;
  users: Partial<User>[] | [];
}> {
  try {
    const users = await prisma.user.findMany({
      where: { approvedAt: null },
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
    console.error("Error fetching unapproved users for bot:", error);
    return { success: false, users: [] };
  }
}

export async function getAllSuspendedUsersForBot(): Promise<{
  success: boolean;
  users: Partial<User>[] | [];
}> {
  try {
    const users = await prisma.user.findMany({
      where: { suspendedAt: { not: null } },
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
    console.error("Error fetching suspended users for bot:", error);
    return { success: false, users: [] };
  }
}

export async function getUserByIdForBot(userId: string): Promise<{
  success: boolean;
  user: Partial<User> | null;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      return { success: false, user: null };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Error fetching user by ID for bot:", error);
    return { success: false, user: null };
  }
}

export async function getUserByEmailForBot(email: string): Promise<{
  success: boolean;
  user: Partial<User> | null;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
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

    if (!user) {
      return { success: false, user: null };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Error fetching user by email for bot:", error);
    return { success: false, user: null };
  }
}
