/*
  Warnings:

  - You are about to drop the column `accountId` on the `newMessage` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `rawMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "newMessage" DROP COLUMN "accountId";

-- AlterTable
ALTER TABLE "rawMessage" DROP COLUMN "accountId";
