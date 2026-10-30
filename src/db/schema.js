import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const guests = sqliteTable('guests', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').default('Umum'),
  phone: text('phone'),
  sent: integer('sent').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  index('idx_guests_name').on(table.name),
  index('idx_guests_created').on(table.createdAt)
]);

export const rsvps = sqliteTable('rsvps', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  city: text('city'),
  category: text('category').default('Umum'),
  attendance: text('attendance').notNull(),
  pax: integer('pax').default(1),
  message: text('message'),
  isVisible: integer('is_visible').default(1),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  index('idx_rsvps_created').on(table.createdAt),
  index('idx_rsvps_visible_created').on(table.isVisible, table.createdAt)
]);

