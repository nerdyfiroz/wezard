import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

// Admin Accounts Table
export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Tasks (Quests) Table
export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // x_follow, x_like, x_repost, visit_url, submit_wallet, custom
  url: text("url"),
  required: boolean("required").default(true).notNull(),
  verificationType: varchar("verification_type", { length: 50 }).default("url").notNull(), // manual, url, api
  active: boolean("active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Whitelist Entries Table (Wallet, Twitter Handle, Reply/Comment Link, Email)
export const whitelistEntries = pgTable("whitelist_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
  twitterUsername: varchar("twitter_username", { length: 100 }).notNull(),
  replyCommentLink: text("reply_comment_link").notNull(),
  email: varchar("email", { length: 255 }),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, approved, rejected
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Task Completions Table
export const taskCompletions = pgTable("task_completions", {
  id: uuid("id").defaultRandom().primaryKey(),
  whitelistEntryId: uuid("whitelist_entry_id")
    .references(() => whitelistEntries.id, { onDelete: "cascade" })
    .notNull(),
  taskId: uuid("task_id")
    .references(() => tasks.id, { onDelete: "cascade" })
    .notNull(),
  proofUrl: text("proof_url"),
  status: varchar("status", { length: 20 }).default("completed").notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Platform Settings Table
export const settings = pgTable("settings", {
  key: varchar("key", { length: 64 }).primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Types export
export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type WhitelistEntry = typeof whitelistEntries.$inferSelect;
export type NewWhitelistEntry = typeof whitelistEntries.$inferInsert;

export type TaskCompletion = typeof taskCompletions.$inferSelect;
export type NewTaskCompletion = typeof taskCompletions.$inferInsert;
