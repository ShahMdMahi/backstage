/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DEVELOPER', 'SYSTEM_ADMIN', 'SYSTEM_MANAGER', 'SYSTEM_USER', 'ACCOUNT_ADMIN', 'ACCOUNT_MANAGER', 'ACCOUNT_USER', 'ARTIST', 'USER');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "ROLE";
