/*
  Warnings:

  - The primary key for the `rawMessage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `authorId` on the `rawMessage` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `rawMessage` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `rawMessage` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `rawMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `binarypayload` to the `rawMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createtime` to the `rawMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromusername` to the `rawMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pushcontent` to the `rawMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tousername` to the `rawMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `rawMessage` table without a default value. This is not possible if the table is not empty.
  - Made the column `content` on table `rawMessage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "rawMessage" DROP CONSTRAINT "rawMessage_pkey",
DROP COLUMN "authorId",
DROP COLUMN "published",
DROP COLUMN "title",
ADD COLUMN     "accountId" INTEGER NOT NULL,
ADD COLUMN     "atList" TEXT[],
ADD COLUMN     "binarypayload" TEXT NOT NULL,
ADD COLUMN     "createtime" INTEGER NOT NULL,
ADD COLUMN     "fromusername" TEXT NOT NULL,
ADD COLUMN     "pushcontent" TEXT NOT NULL,
ADD COLUMN     "tousername" TEXT NOT NULL,
ADD COLUMN     "type" INTEGER NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "content" SET NOT NULL,
ADD CONSTRAINT "rawMessage_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "rawMessage_id_seq";
