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

export const padlocalAccount = pgTable(
  'PadlocalAccount',
  {
    id: serial('id').primaryKey().notNull(),
    token: text('token').notNull(),
    createdAt: timestamp('createdAt', {
      precision: 6,
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', {
      precision: 6,
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      tokenIdx: index('PadlocalAccount_token_idx').on(table.token),
    };
  },
);

export const wechatContact = pgTable(
  'WechatContact',
  {
    id: serial('id').primaryKey().notNull(),
    sourceUsername: text('sourceUsername').notNull(),
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
    contactaddscene: integer('contactaddscene').notNull(),
    stranger: boolean('stranger').notNull(),
    encryptusername: text('encryptusername'),
    phoneList: jsonb('phoneList'),
    chatroomownerusername: text('chatroomownerusername'),
    chatroommaxcount: integer('chatroommaxcount').notNull(),
    chatroommemberList: jsonb('chatroommemberList'),
    label: text('label'),
  },
  (table) => {
    return {
      sourceUsernameUsernameIdx: index(
        'WechatContact_sourceUsername_username_idx',
      ).on(table.sourceUsername, table.username),
      usernameIdx: index('WechatContact_username_idx').on(table.username),
      sourceUsernameUsernameKey: uniqueIndex(
        'WechatContact_sourceUsername_username_key',
      ).on(table.sourceUsername, table.username),
    };
  },
);

export const wechatFriendshipRequest = pgTable('WechatFriendshipRequest', {
  id: serial('id').primaryKey().notNull(),
  sourceUsername: text('sourceUsername').notNull(),
  username: text('username').notNull(),
  encryptUsername: text('encryptUsername').notNull(),
  nickname: text('nickname').notNull(),
  ticket: text('ticket').notNull(),
  requestMessage: text('requestMessage').notNull(),
  scene: integer('scene').notNull(),
  avatar: text('avatar'),
  gender: integer('gender'),
  alias: text('alias'),
  city: text('city'),
  province: text('province'),
  country: text('country'),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('createdAt', {
    precision: 6,
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull(),
});

export const rawMessage = pgTable('RawMessage', {
  id: text('id').primaryKey().notNull(),
  content: text('content').notNull(),
  atList: text('atList').array(),
  binarypayload: text('binarypayload').notNull(),
  createtime: integer('createtime').notNull(),
  fromusername: text('fromusername').notNull(),
  pushcontent: text('pushcontent').notNull(),
  tousername: text('tousername').notNull(),
  type: integer('type').notNull(),
  loggedInUsername: text('loggedInUsername').notNull(),
});
