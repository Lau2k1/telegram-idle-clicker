-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refiningAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "refiningFuelUntil" TIMESTAMP(3),
ADD COLUMN     "refiningOilUntil" TIMESTAMP(3);
