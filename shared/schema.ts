import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: jsonb("content").notNull(),
  lastModified: timestamp("last_modified").notNull().defaultNow(),
});

export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // 'completion' | 'summary'
  createdAt: timestamp("created_at").notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, lastModified: true });
export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).omit({ id: true });

export type Document = typeof documents.$inferSelect;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;