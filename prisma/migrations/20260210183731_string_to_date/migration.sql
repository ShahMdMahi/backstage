/*
  Warnings:

  - Changed the type of `reportingMonth` on the `Report` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `salesMonth` on the `Report` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Report" DROP COLUMN "reportingMonth",
ADD COLUMN     "reportingMonth" TIMESTAMP(3) NOT NULL,
DROP COLUMN "salesMonth",
ADD COLUMN     "salesMonth" TIMESTAMP(3) NOT NULL;
