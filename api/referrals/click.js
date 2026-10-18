// POST /api/referrals/click?code=WARM-XXXXXX — fire-and-forget beacon sent
// when a friend taps "Text Us". Always answers 204 so it reveals nothing.
import { db } from '../../server/db.js';
import { isSameOrigin } from '../../server/http.js';
import { ownCodesFromRequest } from '../../server/ownCodes.js';
import { isRateLimited } from '../../server/rateLimit.js';
import { recordSmsClick } from '../../server/referrals.js';
import { normalizeReferralCode } from '../../src/referral/validation.js';

const RATE_LIMIT = { limit: 30, windowSeconds: 60 };

export async function POST(request) {
  const code = normalizeReferralCode(new URL(request.url).searchParams.get('code'));
  const isOwnLink = Boolean(code) && ownCodesFromRequest(request).includes(code);

  if (code && !isOwnLink && isSameOrigin(request) && db.isConfigured()) {
    try {
      if (!(await isRateLimited(request, 'click', RATE_LIMIT))) await recordSmsClick(code);
    } catch (error) {
      console.error('[referrals] click tracking failed:', error?.message);
    }
  }

  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}
