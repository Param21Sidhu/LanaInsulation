// Validation shared by the sign-up form (instant feedback) and the API
// (the source of truth). Plain JS with no browser or Node APIs.
import { currentTerms, referralConfig } from '../referralConfig.js';

// No 0/O, 1/I/L so codes are easy to read aloud and type from a text.
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;

const CODE_PATTERN = new RegExp(
  `^${referralConfig.codePrefix}-?([${CODE_ALPHABET}]{${CODE_LENGTH}})$`,
);

// Letters (any language), spaces, apostrophes (incl. iOS curly ’), periods, hyphens.
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}'’. -]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const PHONE_CHARS = /^[\d\s+().-]+$/;
// North American numbers: area code and exchange can't start with 0 or 1.
const NANP_PATTERN = /^[2-9]\d{2}[2-9]\d{6}$/;

export const FIELD_ORDER = ['name', 'email', 'phone', 'acceptedTerms'];

// Strips control characters, collapses whitespace and trims.
export function cleanText(value) {
  return String(value ?? '')
    .normalize('NFC')
    .replace(/[\u0000-\u001F\u007F\u200B-\u200F\u2028-\u202F\uFEFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Returns '+1XXXXXXXXXX' for a valid North American number, otherwise null.
export function toE164(value) {
  const raw = cleanText(value);
  if (!raw || !PHONE_CHARS.test(raw)) return null;
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  return NANP_PATTERN.test(digits) ? `+1${digits}` : null;
}

// Formats the phone field as the person types: digits only, a leading country
// code 1 dropped (autofill often adds +1; area codes never start with 1), at
// most 10 digits, shown as 506-555-0123.
export function formatPhoneInput(value) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.startsWith('1')) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (digits.length > 6) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length > 3) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return digits;
}

// '+15065550123' -> '506-555-0123' (matches how the site shows numbers).
export function formatPhone(e164) {
  const d = e164.slice(-10);
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

// Accepts 'warm-7kq2dx', 'WARM 7KQ2DX', 'WARM7KQ2DX'; returns 'WARM-7KQ2DX' or null.
export function normalizeReferralCode(value) {
  const compact = String(value ?? '').toUpperCase().replace(/\s+/g, '');
  const match = compact.match(CODE_PATTERN);
  return match ? `${referralConfig.codePrefix}-${match[1]}` : null;
}

export function validateRegistration(input = {}) {
  const name = cleanText(input.name);
  const email = cleanText(input.email).toLowerCase();
  const rawPhone = cleanText(input.phone);
  const phone = toE164(rawPhone);
  const errors = {};

  if (!name) errors.name = 'Please enter your full name.';
  else if (name.length < 2 || name.length > 100)
    errors.name = 'Please enter a name between 2 and 100 characters.';
  else if (!NAME_PATTERN.test(name))
    errors.name = 'Please use letters only — spaces, hyphens and apostrophes are fine.';

  if (!email) errors.email = 'Please enter your email address.';
  else if (email.length > 254 || !EMAIL_PATTERN.test(email))
    errors.email = 'Please enter a valid email address, like name@example.com.';

  // Required: lets the team spot a self-referral (a text from the referrer's
  // own number) and reach the referrer about their reward.
  if (!rawPhone) errors.phone = 'Please enter your phone number.';
  else if (!phone) errors.phone = 'Please enter a valid 10-digit phone number.';

  // The page sends the terms version it displayed; a mismatch means the terms
  // changed while the page was open, so the person must review the new ones.
  if (input.acceptedTerms !== true)
    errors.acceptedTerms = 'Please confirm you’ve read and agree to the Terms & Conditions.';
  else if (input.termsVersion !== currentTerms.version)
    errors.acceptedTerms =
      'Our referral terms were just updated. Please refresh this page and review them before signing up.';

  const firstName = name.split(' ')[0].slice(0, 40);
  return { errors, values: { name, firstName, email, phone, termsVersion: currentTerms.version } };
}
