// GET /api/referrals/lookup?code=WARM-XXXXXX — used by the friend's landing
// page. Public by design, so it returns only the code and the referrer's first
// name (disclosed to referrers at sign-up), never email or phone.
import { db } from '../../server/db.js';
import { json } from '../../server/http.js';
import { isRateLimited } from '../../server/rateLimit.js';
import { recordLandingView } from '../../server/referrals.js';
import { normalizeReferralCode } from '../../src/referral/validation.js';

const RATE_LIMIT = { limit: 60, windowSeconds: 60 };

export async function GET(request) {
  const code = normalizeReferralCode(new URL(request.url).searchParams.get('code'));
  if (!code) return json({ error: 'not_found' }, 404);
  if (!db.isConfigured()) {
    console.error('[referrals] DATABASE_URL is not set');
    return json({ error: 'unavailable' }, 503);
  }

  try {
    if (await isRateLimited(request, 'lookup', RATE_LIMIT)) {
      return json({ error: 'rate_limited' }, 429, { 'Retry-After': String(RATE_LIMIT.windowSeconds) });
    }
    const referrer = await recordLandingView(code);
    if (!referrer) return json({ error: 'not_found' }, 404);
    return json({ code, firstName: referrer.firstName });
  } catch (error) {
    console.error('[referrals] lookup failed:', error?.message);
    return json({ error: 'server' }, 500);
  }
}
