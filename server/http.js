// Small helpers shared by the referral API functions.

export function json(body, status = 200, headers = {}) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', ...headers },
  });
}

// Browsers always send Origin on cross-site POSTs; reject ones from other
// sites. Requests without Origin (curl, scripts) still hit the rate limits.
export function isSameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    new URL(request.url).host;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// Vercel sets x-real-ip / x-forwarded-for to the real client address.
export function clientIp(request) {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  );
}

// Parses a small JSON object body; returns null for anything else.
export async function readJsonObject(request, maxBytes = 4096) {
  if (Number(request.headers.get('content-length') || 0) > maxBytes) return null;
  const text = await request.text();
  if (text.length > maxBytes) return null;
  try {
    const value = JSON.parse(text);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}
