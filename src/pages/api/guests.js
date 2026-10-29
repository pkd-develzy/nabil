export const prerender = false;

// Helper untuk respons JSON dengan header CORS & JSON
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function OPTIONS() {
  return jsonResponse({ ok: true });
}

export async function GET(context) {
  try {
    const env = context.locals?.runtime?.env;
    const db = env?.DB;

    if (!db) {
      return jsonResponse({ error: 'Database D1 tidak ditemukan pada runtime Cloudflare' }, 500);
    }

    const { results } = await db.prepare('SELECT id, name, category, phone, sent, created_at FROM guests ORDER BY created_at DESC').all();
    return jsonResponse({ success: true, data: results || [] });
  } catch (error) {
    return jsonResponse({ error: error.message || 'Gagal mengambil data tamu' }, 500);
  }
}

export async function POST(context) {
  try {
    const env = context.locals?.runtime?.env;
    const db = env?.DB;

    if (!db) {
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

    // Insert atau update data tamu
    await db.prepare(`
      INSERT INTO guests (id, name, category, phone, sent)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        category = excluded.category,
        phone = excluded.phone,
        sent = excluded.sent
    `).bind(id, name, category, phone, sent).run();

    return jsonResponse({ success: true, guest: { id, name, category, phone, sent: !!sent } });
  } catch (error) {
    return jsonResponse({ error: error.message || 'Gagal menyimpan data tamu' }, 500);
  }
}

export async function DELETE(context) {
  try {
    const env = context.locals?.runtime?.env;
    const db = env?.DB;

    if (!db) {
      return jsonResponse({ error: 'Database D1 tidak ditemukan pada runtime Cloudflare' }, 500);
    }

    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return jsonResponse({ error: 'ID tamu wajib disertakan' }, 400);
    }

    await db.prepare('DELETE FROM guests WHERE id = ?').bind(id).run();
    return jsonResponse({ success: true, message: 'Tamu berhasil dihapus' });
  } catch (error) {
    return jsonResponse({ error: error.message || 'Gagal menghapus data tamu' }, 500);
  }
}

