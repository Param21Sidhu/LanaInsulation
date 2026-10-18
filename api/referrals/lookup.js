// GET /api/referrals/lookup?code=WARM-XXXXXX — used by the friend's landing
// page. Public by design, so it returns only the code and the referrer's first
// name (disclosed to referrers at sign-up), never email or phone. Also says
// whether the code was created on this browser (the referrer's own link).
import { db } from '../../server/db.js';
import { json } from '../../server/http.js';
import { ownCodesFromRequest } from '../../server/ownCodes.js';
import { isRateLimited } from '../../server/rateLimit.js';
import { findReferrer, recordLandingView } from '../../server/referrals.js';
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
    // The referrer looking at their own link isn't a referral visit: known
    // from the cookie, or from `own=1` sent by the device that signed it up.
    const isOwnLink = ownCodesFromRequest(request).includes(code);
    const countVisit = !isOwnLink && new URL(request.url).searchParams.get('own') !== '1';
    const referrer = countVisit ? await recordLandingView(code) : await findReferrer(code);
    if (!referrer) return json({ error: 'not_found' }, 404);
    return json({ code, firstName: referrer.firstName, isOwnLink });
  } catch (error) {
    console.error('[referrals] lookup failed:', error?.message);
    return json({ error: 'server' }, 500);
  }
}
