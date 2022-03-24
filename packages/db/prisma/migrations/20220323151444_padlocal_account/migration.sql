-- CreateEnum
CREATE TYPE "LoginStatus" AS ENUM ('LOGGING_IN', 'LOGGED_IN', 'LOGGED_OUT');

-- CreateTable
CREATE TABLE "PadlocalAccount" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "status" "LoginStatus" NOT NULL DEFAULT E'LOGGED_OUT',
    "qrcode" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PadlocalAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PadlocalAccount_token_idx" ON "PadlocalAccount"("token");
