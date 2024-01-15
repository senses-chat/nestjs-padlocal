DROP TABLE "_prisma_migrations";--> statement-breakpoint
DROP TABLE "KeyValueStorage";--> statement-breakpoint
DROP TABLE "newMessage";--> statement-breakpoint
ALTER TABLE "PadlocalAccount" RENAME TO "padlocal_account";--> statement-breakpoint
ALTER TABLE "rawMessage" RENAME TO "raw_message";--> statement-breakpoint
ALTER TABLE "WechatContact" RENAME TO "wechat_contact";--> statement-breakpoint
ALTER TABLE "WechatFriendshipRequest" RENAME TO "wechat_friendship_request";--> statement-breakpoint
ALTER TABLE "padlocal_account" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "padlocal_account" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "raw_message" RENAME COLUMN "atList" TO "at_list";--> statement-breakpoint
ALTER TABLE "raw_message" RENAME COLUMN "binarypayload" TO "binary_payload";--> statement-breakpoint
ALTER TABLE "raw_message" RENAME COLUMN "createtime" TO "create_time";--> statement-breakpoint
ALTER TABLE "raw_message" RENAME COLUMN "fromusername" TO "from_username";--> statement-breakpoint
ALTER TABLE "raw_message" RENAME COLUMN "pushcontent" TO "push_content";--> statement-breakpoint
ALTER TABLE "raw_message" RENAME COLUMN "tousername" TO "to_username";--> statement-breakpoint
ALTER TABLE "raw_message" RENAME COLUMN "loggedInUsername" TO "logged_in_username";--> statement-breakpoint
ALTER TABLE "wechat_contact" RENAME COLUMN "sourceUsername" TO "source_username";--> statement-breakpoint
ALTER TABLE "wechat_contact" RENAME COLUMN "contactaddscene" TO "contact_add_scene";--> statement-breakpoint
ALTER TABLE "wechat_contact" RENAME COLUMN "encryptusername" TO "encrypt_username";--> statement-breakpoint
ALTER TABLE "wechat_contact" RENAME COLUMN "phoneList" TO "phone_list";--> statement-breakpoint
ALTER TABLE "wechat_contact" RENAME COLUMN "chatroomownerusername" TO "chatroom_owner_username";--> statement-breakpoint
ALTER TABLE "wechat_contact" RENAME COLUMN "chatroommaxcount" TO "chatroom_max_count";--> statement-breakpoint
ALTER TABLE "wechat_contact" RENAME COLUMN "chatroommemberList" TO "chatroom_member_list";--> statement-breakpoint
ALTER TABLE "wechat_friendship_request" RENAME COLUMN "sourceUsername" TO "source_username";--> statement-breakpoint
ALTER TABLE "wechat_friendship_request" RENAME COLUMN "encryptUsername" TO "encrypt_username";--> statement-breakpoint
ALTER TABLE "wechat_friendship_request" RENAME COLUMN "requestMessage" TO "request_message";--> statement-breakpoint
ALTER TABLE "wechat_friendship_request" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
DROP INDEX IF EXISTS "PadlocalAccount_token_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "WechatContact_sourceUsername_username_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "WechatContact_username_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "WechatContact_sourceUsername_username_key";--> statement-breakpoint
ALTER TABLE "padlocal_account" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "padlocal_account" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "wechat_friendship_request" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "padlocal_account_token_idx" ON "padlocal_account" ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wechat_contact_source_username_username_idx" ON "wechat_contact" ("source_username","username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wechat_contact_username_idx" ON "wechat_contact" ("username");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "wechat_contact_source_username_username_key" ON "wechat_contact" ("source_username","username");