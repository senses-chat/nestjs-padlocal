-- CreateTable
CREATE TABLE "WechatFriendshipRequest" (
    "id" SERIAL NOT NULL,
    "sourceUsername" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "encryptUsername" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "ticket" TEXT NOT NULL,
    "requestMessage" TEXT NOT NULL,
    "scene" INTEGER NOT NULL,
    "avatar" TEXT,
    "gender" INTEGER,
    "alias" TEXT,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WechatFriendshipRequest_pkey" PRIMARY KEY ("id")
);
