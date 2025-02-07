import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  googleId: text("google_id").notNull().unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: jsonb("content").notNull(),
  googleDocId: text("google_doc_id"),
  lastSynced: timestamp("last_synced"),
});

export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // 'completion' | 'summary'
  createdAt: timestamp("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, lastSynced: true });
export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).omit({ id: true });

export type User = typeof users.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
