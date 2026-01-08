/*
  Warnings:

  - You are about to drop the column `refiningAmount` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "refiningAmount",
ADD COLUMN     "refiningFuelAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "refiningOilAmount" INTEGER NOT NULL DEFAULT 0;
