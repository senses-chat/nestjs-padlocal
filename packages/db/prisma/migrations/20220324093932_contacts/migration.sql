-- DropEnum
DROP TYPE "LoginStatus";

-- CreateTable
CREATE TABLE "WechatContact" (
    "id" SERIAL NOT NULL,
    "sourceUsername" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "gender" INTEGER NOT NULL,
    "avatar" TEXT,
    "signature" TEXT,
    "alias" TEXT,
    "remark" TEXT,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT,
    "contactaddscene" INTEGER NOT NULL,
    "stranger" BOOLEAN NOT NULL,
    "encryptusername" TEXT,
    "phoneList" JSONB,
    "chatroomownerusername" TEXT,
    "chatroommaxcount" INTEGER NOT NULL,
    "chatroommemberList" JSONB,

    CONSTRAINT "WechatContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WechatContact_sourceUsername_username_idx" ON "WechatContact"("sourceUsername", "username");

-- CreateIndex
CREATE INDEX "WechatContact_username_idx" ON "WechatContact"("username");

-- CreateIndex
CREATE UNIQUE INDEX "WechatContact_sourceUsername_username_key" ON "WechatContact"("sourceUsername", "username");
