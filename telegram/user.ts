"use server";

import "dotenv/config";
import { sendVerificationEmail } from "@/actions/email";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/prisma/client";
import { User } from "@/lib/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.POSTGRES_PRISMA_URL!,
});
const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

export async function getUserAllUsersForBot(): Promise<{
  success: boolean;
  users: Partial<User>[] | [];
}> {
  try {
    console.log("Connecting to database to fetch all users for bot");
    await prisma.$connect();
    console.log("Fetching all users for bot");
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
      console.log("No users found for bot");
      return { success: false, users: [] };
    }

    console.log("Successfully fetched all users for bot");
    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users for bot:", error);
    return { success: false, users: [] };
  } finally {
    console.log("Disconnecting from database after fetching users for bot");
    await prisma.$disconnect();
  }
}

export async function getAllUnverifiedUsersForBot(): Promise<{
  success: boolean;
  users: Partial<User>[] | [];
}> {
  try {
    console.log("Connecting to database to fetch all unverified users for bot");
    await prisma.$connect();
    console.log("Fetching all unverified users for bot");
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
      console.log("No unverified users found for bot");
      return { success: false, users: [] };
    }

    console.log("Successfully fetched all unverified users for bot");
    return { success: true, users };
  } catch (error) {
    console.error("Error fetching unverified users for bot:", error);
    return { success: false, users: [] };
  } finally {
    console.log(
      "Disconnecting from database after fetching unverified users for bot"
    );
    await prisma.$disconnect();
  }
}

export async function getAllUnapprovedUsersForBot(): Promise<{
  success: boolean;
  users: Partial<User>[] | [];
}> {
  try {
    console.log("Connecting to database to fetch all unapproved users for bot");
    await prisma.$connect();
    console.log("Fetching all unapproved users for bot");
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
      console.log("No unapproved users found for bot");
      return { success: false, users: [] };
    }

    console.log("Successfully fetched all unapproved users for bot");
    return { success: true, users };
  } catch (error) {
    console.error("Error fetching unapproved users for bot:", error);
    return { success: false, users: [] };
  } finally {
    console.log(
      "Disconnecting from database after fetching unapproved users for bot"
    );
    await prisma.$disconnect();
  }
}

export async function getAllSuspendedUsersForBot(): Promise<{
  success: boolean;
  users: Partial<User>[] | [];
}> {
  try {
    console.log("Connecting to database to fetch all suspended users for bot");
    await prisma.$connect();
    console.log("Fetching all suspended users for bot");
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
      console.log("No suspended users found for bot");
      return { success: false, users: [] };
    }

    console.log("Successfully fetched all suspended users for bot");
    return { success: true, users };
  } catch (error) {
    console.error("Error fetching suspended users for bot:", error);
    return { success: false, users: [] };
  } finally {
    console.log(
      "Disconnecting from database after fetching suspended users for bot"
    );
    await prisma.$disconnect();
  }
}

export async function getUserByIdForBot(userId: string): Promise<{
  success: boolean;
  user: Partial<User> | null;
}> {
  try {
    console.log("Connecting to database to fetch user by ID for bot");
    await prisma.$connect();
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
      console.log("No user found by ID for bot");
      return { success: false, user: null };
    }

    console.log("Successfully fetched user by ID for bot");
    return { success: true, user };
  } catch (error) {
    console.error("Error fetching user by ID for bot:", error);
    return { success: false, user: null };
  } finally {
    console.log(
      "Disconnecting from database after fetching user by ID for bot"
    );
    await prisma.$disconnect();
  }
}

export async function getUserByEmailForBot(email: string): Promise<{
  success: boolean;
  user: Partial<User> | null;
}> {
  try {
    console.log("Connecting to database to fetch user by email for bot");
    await prisma.$connect();
    console.log("Fetching user by email for bot");
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
      console.log("No user found by email for bot");
      return { success: false, user: null };
    }

    console.log("Successfully fetched user by email for bot");
    return { success: true, user };
  } catch (error) {
    console.error("Error fetching user by email for bot:", error);
    return { success: false, user: null };
  } finally {
    console.log(
      "Disconnecting from database after fetching user by email for bot"
    );
    await prisma.$disconnect();
  }
}

export async function approveUserByIdForBot(
  id: string
): Promise<{ success: boolean; user: Partial<User> | null }> {
  try {
    console.log("Connecting to database to approve user by ID for bot");
    await prisma.$connect();
    console.log("Approving user by ID for bot");
    const user = await prisma.user.update({
      where: { id },
      data: { approvedAt: new Date() },
      select: {
        id: true,
        approvedAt: true,
      },
    });

    if (!user.approvedAt) {
      console.log("Failed to approve user by ID for bot");
      return { success: false, user: null };
    }

    console.log("Successfully approved user by ID for bot");
    return { success: true, user };
  } catch (error) {
    console.error("Error approving user by ID for bot:", error);
    return { success: false, user: null };
  } finally {
    console.log(
      "Disconnecting from database after approving user by ID for bot"
    );
    await prisma.$disconnect();
  }
}

export async function unapproveUserByIdForBot(
  id: string
): Promise<{ success: boolean; user: Partial<User> | null }> {
  try {
    console.log("Connecting to database to unapprove user by ID for bot");
    await prisma.$connect();
    console.log("Unapproving user by ID for bot");
    const user = await prisma.user.update({
      where: { id },
      data: { approvedAt: null },
      select: {
        id: true,
        approvedAt: true,
      },
    });

    if (user.approvedAt) {
      console.log("Failed to unapprove user by ID for bot");
      return { success: false, user: null };
    }

    console.log("Successfully unapproved user by ID for bot");
    return { success: true, user };
  } catch (error) {
    console.error("Error unapproving user by ID for bot:", error);
    return { success: false, user: null };
  } finally {
    console.log(
      "Disconnecting from database after unapproving user by ID for bot"
    );
    await prisma.$disconnect();
  }
}

export async function suspendUserByIdForBot(
  id: string
): Promise<{ success: boolean; user: Partial<User> | null }> {
  try {
    console.log("Connecting to database to suspend user by ID for bot");
    await prisma.$connect();
    console.log("Suspending user by ID for bot");
    const user = await prisma.user.update({
      where: { id },
      data: { suspendedAt: new Date() },
      select: {
        id: true,
        suspendedAt: true,
      },
    });

    if (!user.suspendedAt) {
      console.log("Failed to suspend user by ID for bot");
      return { success: false, user: null };
    }

    console.log("Successfully suspended user by ID for bot");
    return { success: true, user };
  } catch (error) {
    console.error("Error suspending user by ID for bot:", error);
    return { success: false, user: null };
  } finally {
    console.log(
      "Disconnecting from database after suspending user by ID for bot"
    );
    await prisma.$disconnect();
  }
}

export async function unsuspendUserByIdForBot(
  id: string
): Promise<{ success: boolean; user: Partial<User> | null }> {
  try {
    console.log("Connecting to database to unsuspend user by ID for bot");
    await prisma.$connect();
    console.log("Unsuspending user by ID for bot");
    const user = await prisma.user.update({
      where: { id },
      data: { suspendedAt: null },
      select: {
        id: true,
        suspendedAt: true,
      },
    });

    if (user.suspendedAt) {
      console.log("Failed to unsuspend user by ID for bot");
      return { success: false, user: null };
    }

    console.log("Successfully unsuspended user by ID for bot");
    return { success: true, user };
  } catch (error) {
    console.error("Error unsuspending user by ID for bot:", error);
    return { success: false, user: null };
  } finally {
    console.log(
      "Disconnecting from database after unsuspending user by ID for bot"
    );
    await prisma.$disconnect();
  }
}

export async function resendVerificationEmailByIdForBot(
  id: string
): Promise<{ success: boolean; user: Partial<User> | null }> {
  try {
    console.log(
      "Connecting to database to resend verification email by ID for bot"
    );
    await prisma.$connect();
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        verifiedAt: true,
      },
    });

    if (!user) {
      console.log(
        "User not found for resending verification email by ID for bot"
      );
      return { success: false, user: null };
    }

    if (user.verifiedAt) {
      console.log(
        "User already verified, no need to resend verification email for bot"
      );
      return { success: false, user: null };
    }

    console.log("Resending verification email for bot to:", user.email);
    await sendVerificationEmail(user.email);

    console.log("Successfully resent verification email by ID for bot");
    return { success: true, user };
  } catch (error) {
    console.error("Error resending verification email by ID for bot:", error);
    return { success: false, user: null };
  } finally {
    console.log(
      "Disconnecting from database after resending verification email by ID for bot"
    );
    await prisma.$disconnect();
  }
}
