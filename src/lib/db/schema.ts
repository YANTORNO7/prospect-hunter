import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const prospects = sqliteTable("prospects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  name: text("name"),
  bio: text("bio"),
  followers: integer("followers"),
  email: text("email"),
  website: text("website"),
  lastPost: text("last_post"),
  source: text("source").default("instagram"),
  status: text("status").notNull().default("new"),
  messageStatus: text("message_status").notNull().default("none"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prospectId: integer("prospect_id")
    .notNull()
    .references(() => prospects.id),
  content: text("content").notNull(),
  editedContent: text("edited_content"),
  generatedAt: text("generated_at").notNull(),
});

export const searchConfigs = sqliteTable("search_configs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  hashtags: text("hashtags"),
  targetProfiles: text("target_profiles"),
  bioKeywords: text("bio_keywords"),
  location: text("location"),
  createdAt: text("created_at").notNull(),
});
