// Remembers, in an HttpOnly cookie, which referral codes were created on this
// browser, so a referrer who opens their own link isn't offered the friend
// discount. Server-set cookies also outlast Safari's 7-day limit on
// script-written storage. Codes aren't secret, so tampering only affects the
// person doing it.
import { normalizeReferralCode } from '../src/referral/validation.js';

const NAME = 'lana_own_refs';
const MAX_CODES = 10;
const ONE_YEAR = 60 * 60 * 24 * 365;

export function ownCodesFromRequest(request) {
  const match = (request.headers.get('cookie') ?? '').match(/(?:^|;\s*)lana_own_refs=([^;]*)/);
  if (!match) return [];
  return match[1].split('.').map(normalizeReferralCode).filter(Boolean).slice(-MAX_CODES);
}

// Set-Cookie value adding `code` to the codes this browser already has.
export function ownCodesCookie(request, code) {
  const codes = [...ownCodesFromRequest(request).filter((c) => c !== code), code].slice(-MAX_CODES);
  return `${NAME}=${codes.join('.')}; Path=/; Max-Age=${ONE_YEAR}; HttpOnly; Secure; SameSite=Lax`;
}
