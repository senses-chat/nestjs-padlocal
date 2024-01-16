import {
  pgTable,
  timestamp,
  text,
  integer,
  index,
  uniqueIndex,
  serial,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const padlocalAccount = pgTable(
  'padlocal_account',
  {
    id: serial('id').primaryKey().notNull(),
    token: text('token').notNull(),
    createdAt: timestamp('created_at', {
      precision: 6,
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 6,
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      tokenIdx: index('padlocal_account_token_idx').on(table.token),
    };
  },
);

export const padlocalAccountSelectSchema = createSelectSchema(padlocalAccount, {
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const padlocalAccountInsertSchema = createInsertSchema(padlocalAccount);

export const wechatContact = pgTable(
  'wechat_contact',
  {
    id: serial('id').primaryKey().notNull(),
    sourceUsername: text('source_username').notNull(),
    username: text('username').notNull(),
    nickname: text('nickname').notNull(),
    gender: integer('gender').notNull(),
    avatar: text('avatar'),
    signature: text('signature'),
    alias: text('alias'),
    remark: text('remark'),
    city: text('city'),
    province: text('province'),
    country: text('country'),
    contactAddScene: integer('contact_add_scene').notNull(),
    stranger: boolean('stranger').notNull(),
    encryptUsername: text('encrypt_username'),
    phoneList: jsonb('phone_list'),
    chatroomOwnerUsername: text('chatroom_owner_username'),
    chatroomMaxCount: integer('chatroom_max_count').notNull(),
    chatroomMemberList: jsonb('chatroom_member_list'),
    label: text('label'),
  },
  (table) => {
    return {
      sourceUsernameUsernameIdx: index(
        'wechat_contact_source_username_username_idx',
      ).on(table.sourceUsername, table.username),
      usernameIdx: index('wechat_contact_username_idx').on(table.username),
      sourceUsernameUsernameKey: uniqueIndex(
        'wechat_contact_source_username_username_key',
      ).on(table.sourceUsername, table.username),
    };
  },
);

export const wechatFriendshipRequest = pgTable('wechat_friendship_request', {
  id: serial('id').primaryKey().notNull(),
  sourceUsername: text('source_username').notNull(),
  username: text('username').notNull(),
  encryptUsername: text('encrypt_username').notNull(),
  nickname: text('nickname').notNull(),
  ticket: text('ticket').notNull(),
  requestMessage: text('request_message').notNull(),
  scene: integer('scene').notNull(),
  avatar: text('avatar'),
  gender: integer('gender'),
  alias: text('alias'),
  city: text('city'),
  province: text('province'),
  country: text('country'),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull(),
});

export const rawMessage = pgTable('raw_message', {
  id: text('id').primaryKey().notNull(),
  content: text('content').notNull(),
  atList: text('at_list').array(),
  binaryPayload: text('binary_payload').notNull(),
  createTime: integer('create_time').notNull(),
  fromUsername: text('from_username').notNull(),
  pushContent: text('push_content').notNull(),
  toUsername: text('to_username').notNull(),
  type: integer('type').notNull(),
  loggedInUsername: text('logged_in_username').notNull(),
});
