// Asks the server about a referral code. Pass `own` when this device signed up
// the code, so the referrer's own visit isn't counted as a referral visit.
// Resolves to { status: 'found', firstName, isOwnLink }, { status: 'missing' }
// (no such code, e.g. deleted), or { status: 'unknown' } (offline or server
// trouble, so the caller should carry on as best it can).
export async function lookupCode(code, { own = false, signal } = {}) {
  try {
    const response = await fetch(
      `/api/referrals/lookup?code=${encodeURIComponent(code)}${own ? '&own=1' : ''}`,
      { headers: { Accept: 'application/json' }, signal },
    );
    const data = await response.json().catch(() => null);
    if (response.status === 404 && data?.error === 'not_found') return { status: 'missing' };
    if (response.ok && data) return { status: 'found', firstName: data.firstName ?? '', isOwnLink: Boolean(data.isOwnLink) };
    return { status: 'unknown' };
  } catch {
    return { status: 'unknown' };
  }
}
