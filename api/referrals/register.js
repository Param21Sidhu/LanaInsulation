// POST /api/referrals/register — called by the hidden sign-up page.
// Body: { name, email, phone?, acceptedTerms: true, hp: '' }
import { db } from '../../server/db.js';
import { isSameOrigin, json, readJsonObject } from '../../server/http.js';
import { ownCodesCookie } from '../../server/ownCodes.js';
import { isRateLimited } from '../../server/rateLimit.js';
import { createReferrer } from '../../server/referrals.js';
import { validateRegistration } from '../../src/referral/validation.js';

const RATE_LIMIT = { limit: 10, windowSeconds: 15 * 60 };

export async function POST(request) {
  if (!isSameOrigin(request)) return json({ error: 'forbidden' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ error: 'bad_request' }, 415);
  }
  if (!db.isConfigured()) {
    console.error('[referrals] DATABASE_URL is not set');
    return json({ error: 'unavailable' }, 503);
  }

  const body = await readJsonObject(request);
  if (!body) return json({ error: 'bad_request' }, 400);

  try {
    if (await isRateLimited(request, 'register', RATE_LIMIT)) {
      return json({ error: 'rate_limited' }, 429, { 'Retry-After': String(RATE_LIMIT.windowSeconds) });
    }

    // Honeypot: hidden from people, but naive bots fill every field.
    if (body.hp) return json({ error: 'bad_request' }, 400);

    const { errors, values } = validateRegistration(body);
    if (Object.keys(errors).length) return json({ error: 'validation', fields: errors }, 400);

    const result = await createReferrer(values);

    // Never reveal an existing referral link to someone who only knows the
    // email address; the page explains how to get it resent to the contact
    // details on file instead.
    if (result.status === 'exists') return json({ error: 'already_registered' }, 409);

    // Remember on this browser that the code is the referrer's own, so their
    // link won't offer them the friend discount.
    return json({ code: result.code, url: result.url, firstName: values.firstName }, 201, {
      'Set-Cookie': ownCodesCookie(request, result.code),
    });
  } catch (error) {
    console.error('[referrals] registration failed:', error?.message);
    return json({ error: 'server' }, 500);
  }
}
