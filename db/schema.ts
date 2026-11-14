import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const surveyResponses = sqliteTable("survey_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  ratings: text("ratings").notNull(),
  helpful: text("helpful").notNull().default(""),
  improve: text("improve").notNull().default(""),
  additional: text("additional").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
