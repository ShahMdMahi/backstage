/*
  Warnings:

  - You are about to drop the column `raw` on the `Reporting` table. All the data in the column will be lost.
  - Added the required column `file` to the `Reporting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reporting" DROP COLUMN "raw",
ADD COLUMN     "file" TEXT NOT NULL;
