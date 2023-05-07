/*
  Warnings:

  - Added the required column `loggedInUsername` to the `rawMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rawMessage" ADD COLUMN     "loggedInUsername" TEXT NOT NULL;
