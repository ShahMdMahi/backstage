import { z } from "zod";
import {
  REPORTING_TYPE,
  REPORTING_CURRENCY,
  REPORTING_DELIMITER,
} from "@/lib/prisma/enums";

// Maximum file size: 25MB
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

// Schema for creating a reporting entry
export const createReportingSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.type === "text/csv" || file.name.endsWith(".csv"),
      "File must be a CSV file"
    )
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "File size must be less than 25MB"
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters"),
  hash: z
    .string()
    .min(1, "Hash is required")
    .max(64, "Hash must be 64 characters"),
  type: z.enum([REPORTING_TYPE.ANS, REPORTING_TYPE.BELIEVE]),
  currency: z.enum([REPORTING_CURRENCY.USD, REPORTING_CURRENCY.EUR]),
  delimiter: z.enum([REPORTING_DELIMITER.COMMA, REPORTING_DELIMITER.SEMICOLON]),
  reportingMonth: z.date(),
  netRevenue: z.number().min(0),
});

export type CreateReportingData = z.infer<typeof createReportingSchema>;
