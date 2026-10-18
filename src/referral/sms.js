// Builds prefilled SMS links. The visitor's own messaging app sends the text
// after they review it and tap Send — nothing is sent automatically.
import { dollars, referralConfig } from '../referralConfig.js';
import { formatPhone, toE164 } from './validation.js';

const e164 = toE164(referralConfig.businessTextNumber);

export const businessTextNumber = {
  configured: Boolean(e164),
  // The placeholder passes through unchanged so testers can see it in the composer.
  uri: e164 ?? referralConfig.businessTextNumber,
  display: e164 ? formatPhone(e164) : referralConfig.businessTextNumber,
};

// Keep SMS text to plain GSM-7 characters (straight quotes, no em dashes) so
// carriers don't switch to UCS-2 and split the message into more segments.
export function friendMessage({ code, firstName }) {
  const referredBy = firstName ? `by ${firstName}` : 'by a friend';
  return (
    `Hi! I was referred ${referredBy} (referral code: ${code}). ` +
    "I'd like to request a free attic insulation assessment and claim the " +
    `${dollars(referralConfig.friendDiscount)} referral discount. ` +
    'Please let me know the next steps. Thanks!'
  );
}

// encodeURIComponent leaves !'()* alone; encode them too so no messaging app
// misreads the body.
function encodeBody(text) {
  return encodeURIComponent(text).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

// Apple devices (iPhone, iPad — which reports itself as a Mac — and macOS
// Messages) read `sms:<number>&body=`. Android and everything else follow
// RFC 5724: `sms:<number>?body=`.
export function smsPlatform(userAgent = globalThis.navigator?.userAgent ?? '') {
  return /iPhone|iPad|iPod|Macintosh/i.test(userAgent) ? 'apple' : 'standard';
}

export function smsHref(body, { to = businessTextNumber.uri, platform = smsPlatform() } = {}) {
  const separator = platform === 'apple' ? '&' : '?';
  return `sms:${to}${separator}body=${encodeBody(body)}`;
}

// Used only to adjust helper copy; the SMS button is shown everywhere.
export function isLikelyPhone(nav = globalThis.navigator) {
  const ua = nav?.userAgent ?? '';
  return /Android|iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && nav.maxTouchPoints > 1);
}
