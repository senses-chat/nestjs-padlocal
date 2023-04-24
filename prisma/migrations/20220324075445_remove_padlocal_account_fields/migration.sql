/*
  Warnings:

  - You are about to drop the column `qrcode` on the `PadlocalAccount` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PadlocalAccount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PadlocalAccount" DROP COLUMN "qrcode",
DROP COLUMN "status";
