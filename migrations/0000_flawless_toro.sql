-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "KeyValueStorage" (
	"namespace" text NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"expires" integer,
	"createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PadlocalAccount" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "WechatContact" (
	"id" serial PRIMARY KEY NOT NULL,
	"sourceUsername" text NOT NULL,
	"username" text NOT NULL,
	"nickname" text NOT NULL,
	"gender" integer NOT NULL,
	"avatar" text,
	"signature" text,
	"alias" text,
	"remark" text,
	"city" text,
	"province" text,
	"country" text,
	"contactaddscene" integer NOT NULL,
	"stranger" boolean NOT NULL,
	"encryptusername" text,
	"phoneList" jsonb,
	"chatroomownerusername" text,
	"chatroommaxcount" integer NOT NULL,
	"chatroommemberList" jsonb,
	"label" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "WechatFriendshipRequest" (
	"id" serial PRIMARY KEY NOT NULL,
	"sourceUsername" text NOT NULL,
	"username" text NOT NULL,
	"encryptUsername" text NOT NULL,
	"nickname" text NOT NULL,
	"ticket" text NOT NULL,
	"requestMessage" text NOT NULL,
	"scene" integer NOT NULL,
	"avatar" text,
	"gender" integer,
	"alias" text,
	"city" text,
	"province" text,
	"country" text,
	"payload" jsonb NOT NULL,
	"createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "newMessage" (
	"id" text PRIMARY KEY NOT NULL,
	"createTime" text NOT NULL,
	"chatroom" text,
	"fromUsername" text NOT NULL,
	"toUsername" text NOT NULL,
	"atList" text[],
	"content" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rawMessage" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"atList" text[],
	"binarypayload" text NOT NULL,
	"createtime" integer NOT NULL,
	"fromusername" text NOT NULL,
	"pushcontent" text NOT NULL,
	"tousername" text NOT NULL,
	"type" integer NOT NULL,
	"loggedInUsername" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "KeyValueStorage_namespace_idx" ON "KeyValueStorage" ("namespace");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "KeyValueStorage_namespace_key_idx" ON "KeyValueStorage" ("namespace","key");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "KeyValueStorage_namespace_key_key" ON "KeyValueStorage" ("namespace","key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "PadlocalAccount_token_idx" ON "PadlocalAccount" ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "WechatContact_sourceUsername_username_idx" ON "WechatContact" ("sourceUsername","username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "WechatContact_username_idx" ON "WechatContact" ("username");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "WechatContact_sourceUsername_username_key" ON "WechatContact" ("sourceUsername","username");
*/