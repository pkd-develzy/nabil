import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const guests = sqliteTable('guests', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').default('Umum'),
  phone: text('phone'),
  sent: integer('sent').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const rsvps = sqliteTable('rsvps', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  city: text('city'),
  category: text('category').default('Umum'),
  attendance: text('attendance').notNull(),
  pax: integer('pax').default(1),
  message: text('message'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});
