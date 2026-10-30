export const prerender = false;

import { getDb, schema } from '../../db/index.js';
import { desc, eq } from 'drizzle-orm';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  });
}

export async function OPTIONS() {
  return jsonResponse({ ok: true });
}

export async function GET(context) {
  try {
    const d1 = context.locals?.runtime?.env?.DB;
    if (!d1) {
      return jsonResponse({ error: 'Database D1 tidak ditemukan pada runtime Cloudflare' }, 500);
    }

    const db = getDb(d1);
    const results = await db
      .select({
        id: schema.guests.id,
        name: schema.guests.name,
        category: schema.guests.category,
        phone: schema.guests.phone,
        sent: schema.guests.sent,
        created_at: schema.guests.createdAt
      })
      .from(schema.guests)
      .orderBy(desc(schema.guests.createdAt));

    return jsonResponse({ success: true, data: results || [] });
  } catch (error) {
    return jsonResponse({ error: error.message || 'Gagal mengambil data tamu' }, 500);
  }
}

export async function POST(context) {
  try {
    const d1 = context.locals?.runtime?.env?.DB;
    if (!d1) {
      return jsonResponse({ error: 'Database D1 tidak ditemukan pada runtime Cloudflare' }, 500);
    }

    const body = await context.request.json();
    const id = body.id || Date.now().toString();
    const name = (body.name || '').trim();
    const category = body.category || 'Umum';
    const phone = body.phone || '';
    const sent = body.sent ? 1 : 0;

    if (!name) {
      return jsonResponse({ error: 'Nama tamu wajib diisi' }, 400);
    }

    const db = getDb(d1);
    await db
      .insert(schema.guests)
      .values({ id, name, category, phone, sent })
      .onConflictDoUpdate({
        target: schema.guests.id,
        set: { name, category, phone, sent }
      });

    return jsonResponse({
      success: true,
      guest: { id, name, category, phone, sent: !!sent }
    });
  } catch (error) {
    return jsonResponse({ error: error.message || 'Gagal menyimpan data tamu' }, 500);
  }
}

export async function DELETE(context) {
  try {
    const d1 = context.locals?.runtime?.env?.DB;
    if (!d1) {
      return jsonResponse({ error: 'Database D1 tidak ditemukan pada runtime Cloudflare' }, 500);
    }

    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return jsonResponse({ error: 'ID tamu wajib disertakan' }, 400);
    }

    const db = getDb(d1);
    await db.delete(schema.guests).where(eq(schema.guests.id, id));

    return jsonResponse({ success: true, message: 'Tamu berhasil dihapus' });
  } catch (error) {
    return jsonResponse({ error: error.message || 'Gagal menghapus data tamu' }, 500);
  }
}
