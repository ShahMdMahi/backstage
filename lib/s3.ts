import { env } from "@/env";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

declare global {
  var s3: S3Client | undefined;
}

const s3 =
  global.s3 ??
  new S3Client({
    region: env.S3_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    maxAttempts: 3,
  });

if (env.NODE_ENV !== "production") {
  global.s3 = s3;
}

const Bucket = env.S3_BUCKET_NAME;

/* =========================================================
   KEY HELPERS
========================================================= */

export const buildUserAvatarKey = (userId: string) => `avatars/${userId}`;
export const buildReportKey = (reportId: string) => `reports/${reportId}`;

/* =========================================================
   GENERIC S3 OPERATIONS
========================================================= */

export async function uploadFile({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer | Uint8Array | Blob | string;
  contentType?: string;
}) {
  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return { key };
}

export async function deleteFile(key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket,
      Key: key,
    })
  );
  return true;
}

export async function downloadFile(key: string) {
  return s3.send(
    new GetObjectCommand({
      Bucket,
      Key: key,
    })
  );
}

export async function updateFile({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer | Uint8Array | Blob | string;
  contentType?: string;
}) {
  return uploadFile({ key, body, contentType });
}

export async function listFiles(prefix?: string) {
  const res = await s3.send(
    new ListObjectsV2Command({
      Bucket,
      Prefix: prefix,
    })
  );
  return res.Contents || [];
}

export async function fileExists(key: string) {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket,
        Key: key,
      })
    );
    return true;
  } catch {
    return false;
  }
}

export async function getFileMetadata(key: string) {
  return s3.send(
    new HeadObjectCommand({
      Bucket,
      Key: key,
    })
  );
}

export async function copyFile(sourceKey: string, destinationKey: string) {
  await s3.send(
    new CopyObjectCommand({
      Bucket,
      CopySource: `${Bucket}/${sourceKey}`,
      Key: destinationKey,
    })
  );
}

export async function getSignedDownloadUrl(key: string, expiresIn = 60) {
  const command = new GetObjectCommand({
    Bucket,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function getSignedUploadUrl(
  key: string,
  contentType?: string,
  expiresIn = 60
) {
  const command = new PutObjectCommand({
    Bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn });
}
