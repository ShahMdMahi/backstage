import { z } from "zod";
import { ROLE } from "@/lib/prisma/enums";

// Schema for creating a user from system dashboard
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .transform((val) => {
      if (/^01\d{9}$/.test(val)) {
        return "+880" + val;
      }
      return val;
    })
    .refine((val) => /^\+8801\d{9}$/.test(val), "Invalid phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
  avatar: z.string().optional().nullable(),
  role: z
    .enum([ROLE.SYSTEM_OWNER, ROLE.SYSTEM_ADMIN, ROLE.SYSTEM_USER, ROLE.USER])
    .optional(),
});

export type CreateUserData = z.infer<typeof createUserSchema>;

// Schema for updating a user from system dashboard
export const updateUserSchema = z.object({
  id: z.string().cuid("Invalid user ID"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  phone: z
    .string()
    .transform((val) => {
      if (/^01\d{9}$/.test(val)) {
        return "+880" + val;
      }
      return val;
    })
    .refine((val) => /^\+8801\d{9}$/.test(val), "Invalid phone number")
    .optional(),
  avatar: z.string().optional().nullable(),
  role: z
    .enum([ROLE.SYSTEM_OWNER, ROLE.SYSTEM_ADMIN, ROLE.SYSTEM_USER, ROLE.USER])
    .optional(),
  isSuspended: z.boolean().optional(),
});

export type UpdateUserData = z.infer<typeof updateUserSchema>;
