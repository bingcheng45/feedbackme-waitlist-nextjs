import { pgTable, serial, text, timestamp, integer, primaryKey, boolean } from "drizzle-orm/pg-core";
import { z } from "zod";
import type { AdapterAccount } from "@auth/core/adapters";

// Waitlist registrations table
export const waitlistRegistrations = pgTable("waitlist_registrations", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod validation schema
export const waitlistSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name").trim(),
  email: z.string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
});

// NextAuth.js required tables
export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

// Feedback system tables
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  domain: text("domain").notNull(),
  apiKey: text("api_key").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feedbackItems = pgTable("feedback_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'feature', 'bug', 'improvement'
  status: text("status").notNull().default('open'), // 'open', 'in-progress', 'completed', 'rejected'
  priority: text("priority").default('medium'), // 'low', 'medium', 'high'
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "set null" }),
  userEmail: text("user_email"), // For non-authenticated users
  userName: text("user_name"), // For non-authenticated users
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  feedbackItemId: integer("feedback_item_id")
    .notNull()
    .references(() => feedbackItems.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  userEmail: text("user_email"), // For non-authenticated users
  voteType: text("vote_type").notNull(), // 'upvote' or 'downvote'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Validation schemas
export const projectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters").max(50, "Project name must be less than 50 characters").trim(),
  description: z.string().max(200, "Description must be less than 200 characters").optional(),
  domain: z.string().url("Please enter a valid domain URL").or(z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, "Please enter a valid domain")),
});

export const feedbackSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters").trim(),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters").trim(),
  type: z.enum(['feature', 'bug', 'improvement'], {
    required_error: "Please select a feedback type",
  }),
  userEmail: z.string().email("Please enter a valid email address").optional(),
  userName: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters").trim().optional(),
});

export const voteSchema = z.object({
  feedbackItemId: z.number().int().positive("Invalid feedback item ID"),
  voteType: z.enum(['upvote', 'downvote'], {
    required_error: "Please select a vote type",
  }),
  userEmail: z.string().email("Please enter a valid email address").optional(),
});

// TypeScript types
export type WaitlistRegistration = typeof waitlistRegistrations.$inferSelect;
export type NewWaitlistRegistration = typeof waitlistRegistrations.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type FeedbackItem = typeof feedbackItems.$inferSelect;
export type NewFeedbackItem = typeof feedbackItems.$inferInsert;
export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert; 