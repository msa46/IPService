import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const ipRequests = sqliteTable('ip_requests', {
  ip: text('ip').primaryKey(),
  count: integer('count').notNull().default(1),
  lastReset: integer('last_reset', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});