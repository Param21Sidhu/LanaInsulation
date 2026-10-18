import { randomInt } from 'node:crypto';
import { referralConfig, referralUrl, termsVersions } from '../src/referralConfig.js';
import { CODE_ALPHABET, CODE_LENGTH } from '../src/referral/validation.js';
import { db } from './db.js';

// e.g. WARM-7KQ2DX. crypto.randomInt is unbiased; 31^6 ≈ 887 million codes.
export function generateReferralCode() {
  let suffix = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    suffix += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return `${referralConfig.codePrefix}-${suffix}`;
}

// Inserts a new referrer, recording which terms version they accepted, when,
// and the amounts in those terms. Email uniqueness is enforced by the
// database, so two simultaneous sign-ups with the same email can't both
// succeed, and an existing record (and its acceptance) is never overwritten.
// Resolves to { status: 'created', code, url } or { status: 'exists' }.
export async function createReferrer({ name, firstName, email, phone, termsVersion }) {
  const terms = termsVersions.find((entry) => entry.version === termsVersion);
  if (!terms) throw new Error(`Unknown terms version ${termsVersion}`);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateReferralCode();
    const url = referralUrl(code);
    try {
      const rows = await db.query(
        `INSERT INTO referrers (full_name, first_name, email, phone, referral_code, referral_url,
                                terms_version, terms_accepted_at, referrer_reward_cad, friend_discount_cad)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now(), $8, $9)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [name, firstName, email, phone, code, url, terms.version, terms.referrerReward, terms.friendDiscount],
      );
      return rows.length ? { status: 'created', code, url } : { status: 'exists' };
    } catch (error) {
      // Email conflicts are absorbed above, so a unique violation here is a
      // (very unlikely) referral-code collision: try a fresh code.
      if (error?.code !== '23505') throw error;
    }
  }
  throw new Error('Could not generate a unique referral code');
}

// Looks up a code without counting a visit.
export async function findReferrer(code) {
  const [row] = await db.query('SELECT first_name FROM referrers WHERE referral_code = $1', [code]);
  return row ? { firstName: row.first_name } : null;
}

// Looks up a code for the friend's landing page and counts the visit.
// Only the first name leaves the database.
export async function recordLandingView(code) {
  const [row] = await db.query(
    `UPDATE referrers SET landing_views = landing_views + 1
     WHERE referral_code = $1
     RETURNING first_name`,
    [code],
  );
  return row ? { firstName: row.first_name } : null;
}

// Counts taps on "Text Us". This only means the SMS composer was opened —
// it can't tell whether a text was actually sent.
export async function recordSmsClick(code) {
  await db.query(
    'UPDATE referrers SET sms_clicks = sms_clicks + 1 WHERE referral_code = $1',
    [code],
  );
}
