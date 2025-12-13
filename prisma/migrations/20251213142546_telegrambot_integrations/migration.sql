-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('SYSTEM_ADMIN', 'SYSTEM_MANAGER', 'SYSTEM_USER', 'ACCOUNT_ADMIN', 'ACCOUNT_MANAGER', 'ACCOUNT_USER', 'ARTIST', 'USER');

-- CreateEnum
CREATE TYPE "SESSION_DEVICE_TYPE" AS ENUM ('DESKTOP', 'LAPTOP', 'TABLET', 'MOBILE', 'OTHER');

-- CreateEnum
CREATE TYPE "AUDIT_LOG_ACTION" AS ENUM ('USER_REGISTERED', 'USER_LOGGED_IN', 'USER_LOGGED_OUT', 'USER_RESEND_VERIFICATION', 'USER_FORGOT_PASSWORD', 'USER_RESET_PASSWORD', 'USER_VERIFIED', 'USER_SUSPENDED', 'USER_APPROVED', 'USER_PASSWORD_CHANGED', 'USER_UPDATED', 'USER_DELETED', 'SESSION_CREATED', 'SESSION_REVOKED', 'SESSION_ACCESSED');

-- CreateEnum
CREATE TYPE "AUDIT_LOG_ENTITY" AS ENUM ('USER', 'SESSION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "ROLE" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "deviceFingerprint" TEXT NOT NULL,
    "metadata" JSONB,
    "deviceType" "SESSION_DEVICE_TYPE" NOT NULL DEFAULT 'OTHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "accessedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "entityId" TEXT NOT NULL,
    "bySystem" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "metadata" JSONB,
    "action" "AUDIT_LOG_ACTION" NOT NULL,
    "entity" "AUDIT_LOG_ENTITY" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
