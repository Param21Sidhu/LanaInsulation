import { createHash } from 'node:crypto';
import { db } from './db.js';
import { clientIp } from './http.js';

// Fixed-window counter per client IP, stored in Postgres so it holds across
// function instances. Only a hash of the IP is stored, and rows expire.
export async function isRateLimited(request, bucket, { limit, windowSeconds }) {
  const ipHash = createHash('sha256').update(clientIp(request)).digest('hex').slice(0, 32);

  const [row] = await db.query(
    `INSERT INTO referral_rate_limits (key, hits, expires_at)
     VALUES ($1, 1, now() + $2::int * interval '1 second')
     ON CONFLICT (key) DO UPDATE SET
       hits = CASE WHEN referral_rate_limits.expires_at <= now() THEN 1
                   ELSE referral_rate_limits.hits + 1 END,
       expires_at = CASE WHEN referral_rate_limits.expires_at <= now() THEN EXCLUDED.expires_at
                         ELSE referral_rate_limits.expires_at END
     RETURNING hits`,
    [`${bucket}:${ipHash}`, windowSeconds],
  );

  // Occasionally sweep expired rows so the table stays tiny.
  if (Math.random() < 0.02) {
    await db.query('DELETE FROM referral_rate_limits WHERE expires_at <= now()');
  }

  return row.hits > limit;
}
