/*
  Warnings:

  - Added the required column `artist` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `channel` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isrc` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netRevenueInEur` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netRevenueInUsd` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseCatalogId` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseTitle` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportingCurrency` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportingMonth` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportingType` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salesMonth` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `territory` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trackTitle` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `upc` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "artist" TEXT NOT NULL,
ADD COLUMN     "channel" TEXT NOT NULL,
ADD COLUMN     "isrc" TEXT NOT NULL,
ADD COLUMN     "label" TEXT NOT NULL,
ADD COLUMN     "netRevenueInEur" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "netRevenueInUsd" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "releaseCatalogId" TEXT NOT NULL,
ADD COLUMN     "releaseTitle" TEXT NOT NULL,
ADD COLUMN     "reportingCurrency" "REPORTING_CURRENCY" NOT NULL,
ADD COLUMN     "reportingMonth" TEXT NOT NULL,
ADD COLUMN     "reportingType" "REPORTING_TYPE" NOT NULL,
ADD COLUMN     "salesMonth" TEXT NOT NULL,
ADD COLUMN     "service" TEXT NOT NULL,
ADD COLUMN     "territory" TEXT NOT NULL,
ADD COLUMN     "trackTitle" TEXT NOT NULL,
ADD COLUMN     "upc" TEXT NOT NULL;
