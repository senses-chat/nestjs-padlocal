-- CreateTable
CREATE TABLE "newMessage" (
    "accountId" INTEGER NOT NULL,
    "id" TEXT NOT NULL,
    "createTime" TEXT NOT NULL,
    "chatroom" TEXT NOT NULL,
    "fromUsername" TEXT NOT NULL,
    "toUsername" TEXT NOT NULL,
    "atList" TEXT[],
    "content" JSONB NOT NULL,

    CONSTRAINT "newMessage_pkey" PRIMARY KEY ("id")
);
