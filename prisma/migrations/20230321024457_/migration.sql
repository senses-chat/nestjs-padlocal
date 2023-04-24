/*
  Warnings:

  - Added the required column `authorId` to the `rawMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `rawMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rawMessage" ADD COLUMN     "authorId" INTEGER NOT NULL,
ADD COLUMN     "content" TEXT,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT NOT NULL;
