import { z } from "zod";
import {
  USER_SYSTEM_ACCESS_LEVEL,
  WORKSPACE_ACCOUNT_SYSTEM_ACCESS_LEVEL,
  REPORTING_SYSTEM_ACCESS_LEVEL,
  RELEASE_SYSTEM_ACCESS_LEVEL,
  TRACK_SYSTEM_ACCESS_LEVEL,
  VIDEO_SYSTEM_ACCESS_LEVEL,
  RINGTONE_SYSTEM_ACCESS_LEVEL,
  ARTIST_SYSTEM_ACCESS_LEVEL,
  PERFORMER_SYSTEM_ACCESS_LEVEL,
  PRODUCER_AND_ENGINEER_SYSTEM_ACCESS_LEVEL,
  WRITER_SYSTEM_ACCESS_LEVEL,
  PUBLISHER_SYSTEM_ACCESS_LEVEL,
  LABEL_SYSTEM_ACCESS_LEVEL,
  TRANSACTION_SYSTEM_ACCESS_LEVEL,
  WITHDRAW_SYSTEM_ACCESS_LEVEL,
  CONSUMPTION_SYSTEM_ACCESS_LEVEL,
  ENGAGEMENT_SYSTEM_ACCESS_LEVEL,
  REVENUE_SYSTEM_ACCESS_LEVEL,
  GEO_SYSTEM_ACCESS_LEVEL,
  RIGHTS_MANAGEMENT_SYSTEM_ACCESS_LEVEL,
} from "@/lib/prisma/enums";

// Define individual access level schemas as arrays of enum values
const userAccessSchema = z.array(z.enum(USER_SYSTEM_ACCESS_LEVEL)).optional();

const workspaceAccessSchema = z
  .array(z.enum(WORKSPACE_ACCOUNT_SYSTEM_ACCESS_LEVEL))
  .optional();

const reportingAccessSchema = z
  .array(z.enum(REPORTING_SYSTEM_ACCESS_LEVEL))
  .optional();

const releaseAccessSchema = z
  .array(z.enum(RELEASE_SYSTEM_ACCESS_LEVEL))
  .optional();

const trackAccessSchema = z.array(z.enum(TRACK_SYSTEM_ACCESS_LEVEL)).optional();

const videoAccessSchema = z.array(z.enum(VIDEO_SYSTEM_ACCESS_LEVEL)).optional();

const ringtoneAccessSchema = z
  .array(z.enum(RINGTONE_SYSTEM_ACCESS_LEVEL))
  .optional();

const artistAccessSchema = z
  .array(z.enum(ARTIST_SYSTEM_ACCESS_LEVEL))
  .optional();

const performerAccessSchema = z
  .array(z.enum(PERFORMER_SYSTEM_ACCESS_LEVEL))
  .optional();

const producerEngineerAccessSchema = z
  .array(z.enum(PRODUCER_AND_ENGINEER_SYSTEM_ACCESS_LEVEL))
  .optional();

const writerAccessSchema = z
  .array(z.enum(WRITER_SYSTEM_ACCESS_LEVEL))
  .optional();

const publisherAccessSchema = z
  .array(z.enum(PUBLISHER_SYSTEM_ACCESS_LEVEL))
  .optional();

const labelAccessSchema = z.array(z.enum(LABEL_SYSTEM_ACCESS_LEVEL)).optional();

const transactionAccessSchema = z
  .array(z.enum(TRANSACTION_SYSTEM_ACCESS_LEVEL))
  .optional();

const withdrawAccessSchema = z
  .array(z.enum(WITHDRAW_SYSTEM_ACCESS_LEVEL))
  .optional();

const consumptionAccessSchema = z
  .array(z.enum(CONSUMPTION_SYSTEM_ACCESS_LEVEL))
  .optional();

const engagementAccessSchema = z
  .array(z.enum(ENGAGEMENT_SYSTEM_ACCESS_LEVEL))
  .optional();

const revenueAccessSchema = z
  .array(z.enum(REVENUE_SYSTEM_ACCESS_LEVEL))
  .optional();

const geoAccessSchema = z.array(z.enum(GEO_SYSTEM_ACCESS_LEVEL)).optional();

const rightsManagementAccessSchema = z
  .array(z.enum(RIGHTS_MANAGEMENT_SYSTEM_ACCESS_LEVEL))
  .optional();

// Combined permissions schema
const permissionsSchema = z
  .object({
    userAccess: userAccessSchema,
    workspaceAccess: workspaceAccessSchema,
    reportingAccess: reportingAccessSchema,
    releaseAccess: releaseAccessSchema,
    trackAccess: trackAccessSchema,
    videoAccess: videoAccessSchema,
    ringtoneAccess: ringtoneAccessSchema,
    artistAccess: artistAccessSchema,
    performerAccess: performerAccessSchema,
    producerEngineerAccess: producerEngineerAccessSchema,
    writerAccess: writerAccessSchema,
    publisherAccess: publisherAccessSchema,
    labelAccess: labelAccessSchema,
    transactionAccess: transactionAccessSchema,
    withdrawAccess: withdrawAccessSchema,
    consumptionAccess: consumptionAccessSchema,
    engagementAccess: engagementAccessSchema,
    revenueAccess: revenueAccessSchema,
    geoAccess: geoAccessSchema,
    rightsManagementAccess: rightsManagementAccessSchema,
  })
  .optional();

export const createAccessSchema = z.object({
  userId: z.string().min(1, "Please select a user"),
  expiresAt: z.date(),
  permissions: permissionsSchema,
});

export type CreateAccessData = z.infer<typeof createAccessSchema>;

export const updateAccessSchema = z.object({
  id: z.string().min(1, "Access ID is required"),
  expiresAt: z.date(),
  isSuspended: z.boolean().optional(),
  permissions: permissionsSchema,
});

export type UpdateAccessData = z.infer<typeof updateAccessSchema>;

// Export individual types for convenience
export type UserAccess = z.infer<typeof userAccessSchema>;
export type WorkspaceAccess = z.infer<typeof workspaceAccessSchema>;
export type ReportingAccess = z.infer<typeof reportingAccessSchema>;
export type ReleaseAccess = z.infer<typeof releaseAccessSchema>;
export type TrackAccess = z.infer<typeof trackAccessSchema>;
export type VideoAccess = z.infer<typeof videoAccessSchema>;
export type RingtoneAccess = z.infer<typeof ringtoneAccessSchema>;
export type ArtistAccess = z.infer<typeof artistAccessSchema>;
export type PerformerAccess = z.infer<typeof performerAccessSchema>;
export type ProducerEngineerAccess = z.infer<
  typeof producerEngineerAccessSchema
>;
export type WriterAccess = z.infer<typeof writerAccessSchema>;
export type PublisherAccess = z.infer<typeof publisherAccessSchema>;
export type LabelAccess = z.infer<typeof labelAccessSchema>;
export type TransactionAccess = z.infer<typeof transactionAccessSchema>;
export type WithdrawAccess = z.infer<typeof withdrawAccessSchema>;
export type ConsumptionAccess = z.infer<typeof consumptionAccessSchema>;
export type EngagementAccess = z.infer<typeof engagementAccessSchema>;
export type RevenueAccess = z.infer<typeof revenueAccessSchema>;
export type GeoAccess = z.infer<typeof geoAccessSchema>;
export type RightsManagementAccess = z.infer<
  typeof rightsManagementAccessSchema
>;
export type Permissions = z.infer<typeof permissionsSchema>;
