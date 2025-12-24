import z from "zod";

export const updateMeSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must be at most 100 characters long")
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
  avatar: z.string().nullable().optional(),
});

export const updateMyPasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Current Password must be at least 8 characters long"),
    newPassword: z
      .string()
      .min(8, "New Password must be at least 8 characters long")
      .refine(
        (val) => /[a-z]/.test(val),
        "New Password must contain at least one lowercase letter"
      )
      .refine(
        (val) => /[A-Z]/.test(val),
        "New Password must contain at least one uppercase letter"
      )
      .refine(
        (val) => /\d/.test(val),
        "New Password must contain at least one digit"
      )
      .refine(
        (val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(val),
        "New Password must contain at least one special character"
      ),
    confirmNewPassword: z
      .string()
      .min(8, "Confirm New Password must be at least 8 characters long"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New Passwords do not match",
    path: ["confirmNewPassword"],
  });

export type UpdateMeData = z.infer<typeof updateMeSchema>;
export type UpdateMyPasswordData = z.infer<typeof updateMyPasswordSchema>;
