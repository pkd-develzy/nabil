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
        id: schema.rsvps.id,
        name: schema.rsvps.name,
        city: schema.rsvps.city,
        category: schema.rsvps.category,
        attendance: schema.rsvps.attendance,
        pax: schema.rsvps.pax,
        message: schema.rsvps.message,
        created_at: schema.rsvps.createdAt
      })
      .from(schema.rsvps)
      .orderBy(desc(schema.rsvps.createdAt))
      .limit(200);

    return jsonResponse({ success: true, data: results || [] });
  } catch (error) {
    return jsonResponse({ error: error.message || 'Gagal mengambil data RSVP' }, 500);
  }
}

export async function POST(context) {
  try {
    const d1 = context.locals?.runtime?.env?.DB;
    if (!d1) {
      return jsonResponse({ error: 'Database D1 tidak ditemukan pada runtime Cloudflare' }, 500);
    }

    const body = await context.request.json();
    const name = (body.name || '').trim();
    const city = (body.city || body.asal || '').trim();
    const category = (body.category || body.kategori || 'Umum').trim();
    const attendance = body.attendance || 'Hadir';
    const pax = parseInt(body.pax, 10) || 1;
    const message = (body.message || '').trim();

    if (!name) {
      return jsonResponse({ error: 'Nama pengirim wajib diisi' }, 400);
    }

    const db = getDb(d1);
    const inserted = await db
      .insert(schema.rsvps)
      .values({
        name,
        city,
        category,
        attendance,
        pax,
        message
      })
      .returning();

    return jsonResponse({
      success: true,
      rsvp: inserted[0] || {
        name,
        city,
        category,
        attendance,
        pax,
        message,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    return jsonResponse({ error: error.message || 'Gagal menyimpan respon RSVP' }, 500);
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
      return jsonResponse({ error: 'ID RSVP wajib disertakan' }, 400);
    }

    const db = getDb(d1);
    await db.delete(schema.rsvps).where(eq(schema.rsvps.id, Number(id)));

    return jsonResponse({ success: true, message: 'RSVP berhasil dihapus' });
  } catch (error) {
    return jsonResponse({ error: error.message || 'Gagal menghapus RSVP' }, 500);
  }
}
