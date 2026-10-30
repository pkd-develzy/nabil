export const prerender = false;

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  });
}

export async function OPTIONS() {
  return jsonResponse({ ok: true });
}

export async function POST(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const token = body.token || body['cf-turnstile-response'];

    if (!token) {
      return jsonResponse({ success: false, error: 'Token Turnstile tidak ditemukan.' }, 400);
    }

    const secret = context.locals?.runtime?.env?.TURNSTILE_SECRET_KEY || '0x4AAAAAAFspfT-5q0JbjfvkyGajrWw0Nc0';
    const clientIp = context.request.headers.get('CF-Connecting-IP') || context.request.headers.get('x-forwarded-for') || '';

    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token);
    if (clientIp) formData.append('remoteip', clientIp);

    const cfRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const cfData = await cfRes.json();

    if (cfData.success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': 'azluna_turnstile_verified=1; Path=/; Max-Age=86400; SameSite=Lax; Secure'
        }
      });
    } else {
      return jsonResponse({
        success: false,
        error: 'Verifikasi bot gagal. Akses ditolak.',
        details: cfData['error-codes']
      }, 403);
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

