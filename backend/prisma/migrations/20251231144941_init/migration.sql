/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
ALTER COLUMN "coins" SET DEFAULT 0,
ALTER COLUMN "coins" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "incomePerSec" SET DEFAULT 0;
