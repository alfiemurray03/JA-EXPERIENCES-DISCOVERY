import { mysqlTable, int, varchar, text, timestamp } from 'drizzle-orm/mysql-core';

/**
 * Example Table
 * This is a placeholder table for future database needs
 */
export const exampleTable = mysqlTable('example_table', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type ExampleRecord = typeof exampleTable.$inferSelect;
export type NewExampleRecord = typeof exampleTable.$inferInsert;
