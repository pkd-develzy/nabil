export const prerender = false;

import { getDb, schema } from '../../db/index.js';
import { desc, eq, or, isNull } from 'drizzle-orm';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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

    const url = new URL(context.request.url);
    const isAdmin = url.searchParams.get('admin') === '1' || url.searchParams.get('all') === '1';

    const db = getDb(d1);
    let query = db
      .select({
        id: schema.rsvps.id,
        name: schema.rsvps.name,
        city: schema.rsvps.city,
        category: schema.rsvps.category,
        attendance: schema.rsvps.attendance,
        pax: schema.rsvps.pax,
        message: schema.rsvps.message,
        is_visible: schema.rsvps.isVisible,
        created_at: schema.rsvps.createdAt
      })
      .from(schema.rsvps);

    if (!isAdmin) {
      // Halaman publik hanya menampilkan ucapan yang disetujui / aktif (is_visible = 1)
      query = query.where(or(eq(schema.rsvps.isVisible, 1), isNull(schema.rsvps.isVisible)));
    }

    const results = await query.orderBy(desc(schema.rsvps.createdAt)).limit(300);

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

    // Support toggle action via POST as fallback
    if (body.action === 'toggle' && body.id) {
      const db = getDb(d1);
      const isVisible = body.is_visible ? 1 : 0;
      await db
        .update(schema.rsvps)
        .set({ isVisible })
        .where(eq(schema.rsvps.id, Number(body.id)));
      return jsonResponse({ success: true, is_visible: isVisible });
    }

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
        message,
        isVisible: 1
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
        is_visible: 1,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    return jsonResponse({ error: error.message || 'Gagal menyimpan respon RSVP' }, 500);
  }
}

export async function PATCH(context) {
  try {
    const d1 = context.locals?.runtime?.env?.DB;
    if (!d1) {
      return jsonResponse({ error: 'Database D1 tidak ditemukan pada runtime Cloudflare' }, 500);
    }

    const body = await context.request.json();
    const id = Number(body.id);
    const isVisible = body.is_visible ? 1 : 0;

    if (!id) {
      return jsonResponse({ error: 'ID RSVP wajib disertakan' }, 400);
    }

    const db = getDb(d1);
    await db
      .update(schema.rsvps)
      .set({ isVisible })
      .where(eq(schema.rsvps.id, id));

    return jsonResponse({ success: true, is_visible: isVisible, message: 'Status visibilitas ucapan berhasil diperbarui' });
  } catch (error) {
    return jsonResponse({ error: error.message || 'Gagal mengubah status visibilitas' }, 500);
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
    const isAll = url.searchParams.get('all') === '1';

    if (!id && !isAll) {
      return jsonResponse({ error: 'ID RSVP atau parameter all wajib disertakan' }, 400);
    }

    const db = getDb(d1);
    if (isAll) {
      await db.delete(schema.rsvps);
      return jsonResponse({ success: true, message: 'Semua RSVP berhasil dihapus' });
    }

    await db.delete(schema.rsvps).where(eq(schema.rsvps.id, Number(id)));

    return jsonResponse({ success: true, message: 'RSVP berhasil dihapus' });
  } catch (error) {
    return jsonResponse({ error: error.message || 'Gagal menghapus RSVP' }, 500);
  }
}
