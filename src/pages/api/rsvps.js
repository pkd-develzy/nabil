export const prerender = false;

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    const { results } = await db.prepare('SELECT id, name, attendance, pax, message, created_at FROM rsvps ORDER BY created_at DESC LIMIT 100').all();
    return jsonResponse({ success: true, data: results || [] });
  } catch (error) {
    return jsonResponse({ error: error.message || 'Gagal mengambil data RSVP' }, 500);
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
    const name = (body.name || '').trim();
    const attendance = body.attendance || 'hadir';
    const pax = parseInt(body.pax, 10) || 1;
    const message = (body.message || '').trim();

    if (!name) {
      return jsonResponse({ error: 'Nama pengirim wajib diisi' }, 400);
    }

    const result = await db.prepare(`
      INSERT INTO rsvps (name, attendance, pax, message)
      VALUES (?, ?, ?, ?)
    `).bind(name, attendance, pax, message).run();

    return jsonResponse({
      success: true,
      rsvp: {
        id: result.meta?.last_row_id,
        name,
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

