// Landing page for a referred friend: /warmth/WARM-XXXXXX.
// One tap opens their SMS app with our number and a prefilled message.
import { useEffect, useState } from 'react';
import { dollars, friendSummary, friendTerms, referralConfig } from '../referralConfig.js';
import { IconCheck, IconCopy, IconMessage } from './icons.jsx';
import ReferralLayout from './ReferralLayout.jsx';
import { businessTextNumber, friendMessage, isLikelyPhone, smsHref } from './sms.js';
import { useCopy } from './useCopy.js';
import { normalizeReferralCode } from './validation.js';

const discount = dollars(referralConfig.friendDiscount);

function codeFromLocation() {
  const prefix = `${referralConfig.referralPath}/`;
  const { pathname } = window.location;
  if (!pathname.startsWith(prefix)) return null;
  try {
    return normalizeReferralCode(decodeURIComponent(pathname.slice(prefix.length).replace(/\/+$/, '')));
  } catch {
    return null;
  }
}

export default function FriendPage() {
  const [code] = useState(codeFromLocation);
  const [lookup, setLookup] = useState(code ? { status: 'loading' } : { status: 'invalid' });

  useEffect(() => {
    if (!code) return undefined;
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    fetch(`/api/referrals/lookup?code=${encodeURIComponent(code)}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (response.status === 404 && data?.error === 'not_found') return { status: 'invalid' };
        return { status: 'ready', firstName: response.ok ? data?.firstName ?? '' : '' };
      })
      // If the lookup fails for any other reason (offline, server trouble),
      // still let the friend text us: the code comes from the link itself and
      // our team verifies every referral by hand anyway.
      .catch(() => ({ status: 'ready', firstName: '' }))
      .then((result) => {
        if (active) setLookup(result);
      })
      .finally(() => clearTimeout(timer));

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [code]);

  useEffect(() => {
    if (lookup.status === 'ready') document.title = `You’ve Been Referred — ${discount} Off | Lana Insulation`;
    if (lookup.status === 'invalid') document.title = 'Referral Link Not Found | Lana Insulation';
  }, [lookup.status]);

  let content;
  if (lookup.status === 'loading') {
    content = (
      <section className="container">
        <div className="referral-card referral-loading" role="status">
          <span className="spinner spinner--dark" aria-hidden="true" />
          Loading your referral offer…
        </div>
      </section>
    );
  } else if (lookup.status === 'invalid') {
    content = <InvalidReferral />;
  } else {
    content = <ReferralOffer code={code} firstName={lookup.firstName} />;
  }

  return <ReferralLayout>{content}</ReferralLayout>;
}

// Best-effort count of "Text Us" taps. It can't confirm a text was sent.
function trackSmsClick(code) {
  const url = `/api/referrals/click?code=${encodeURIComponent(code)}`;
  try {
    if (navigator.sendBeacon?.(url)) return;
    fetch(url, { method: 'POST', keepalive: true }).catch(() => {});
  } catch {
    // Tracking must never get in the way of texting.
  }
}

function ReferralOffer({ code, firstName }) {
  const message = friendMessage({ code, firstName });
  const [opened, setOpened] = useState(false);
  const [copyStatus, copy] = useCopy();
  const onPhone = isLikelyPhone();

  const handleTextClick = () => {
    // No preventDefault: the link itself opens the SMS app, from this tap.
    setOpened(true);
    trackSmsClick(code);
  };

  return (
    <>
      <section className="container referral-intro">
        <span className="badge">
          <span className="badge__dot" />
          {firstName ? `${firstName} referred you` : 'Referral offer'}
        </span>
        <h1 className="referral-title">You’ve Been Referred! Get {discount} Off Attic Insulation.</h1>
        <p className="referral-lead">
          Request a free attic insulation assessment and ask about your {discount} referral discount.
        </p>
        <p className="offer-terms">
          {friendSummary}{' '}
          <a className="offer-terms__link" href={referralConfig.termsPath}>
            View Full Offer Terms
          </a>
        </p>
      </section>

      <section className="container referral-stack">
        <div className="referral-card referral-claim">
          <div className="code-box">
            <span className="code-box__label">Your referral code</span>
            <span className="code-box__code">{code}</span>
            {firstName && <span className="code-box__meta">from {firstName}</span>}
          </div>

          {!onPhone && (
            <p className="claim-hint">
              On a computer? This button works best on your phone. You can also copy the message
              below and text it from any phone.
            </p>
          )}

          <a className="btn btn--primary btn--lg btn--block referral-cta" href={smsHref(message)} onClick={handleTextClick}>
            <IconMessage />
            Text Us — Claim My {discount} Off
          </a>
          <p className="action-note" aria-live="polite">
            {opened
              ? 'Your messaging app should open with the message ready. Review it and tap Send — it isn’t sent until you do.'
              : 'Opens your messaging app with a ready-to-send message. Nothing is sent until you tap Send.'}
          </p>
        </div>

        <div className="referral-card">
          <h2 className="referral-h2">Button didn’t work?</h2>
          <p className="referral-text">
            Text this message to <strong className="nowrap">{businessTextNumber.display}</strong> from
            your phone and we’ll reply with next steps:
          </p>
          <p className="sms-bubble">{message}</p>
          <button type="button" className="btn btn--ghost btn--lg btn--block" onClick={() => copy(message)}>
            {copyStatus === 'copied' ? <IconCheck /> : <IconCopy />}
            {copyStatus === 'copied' ? 'Message Copied' : 'Copy Message'}
          </button>
          <p className="action-note" aria-live="polite">
            {copyStatus === 'copied' && `Now paste it into a new text to ${businessTextNumber.display}.`}
            {copyStatus === 'failed' && 'Press and hold the message above to copy it.'}
          </p>
        </div>

        <div className="referral-info">
          <h2 className="referral-h2">What you’re getting</h2>
          <ul className="info-list">
            <li>
              <strong>A free attic assessment.</strong> We check your attic and give you a clear,
              honest price — no cost and no pressure to book.
            </li>
            <li>
              <strong>Blown-in insulation.</strong> Even cellulose or fiberglass coverage that
              helps keep heat in. Results vary by home.
            </li>
            <li>
              <strong>{discount} off.</strong> Your referral discount comes off a qualifying
              installation.
            </li>
          </ul>

          <h2 className="referral-h2">Key conditions</h2>
          <ul className="terms-list">
            {friendTerms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>

          <p className="referral-more">
            <a href={referralConfig.termsPath}>Read the full Terms &amp; Conditions →</a>
          </p>
          <p className="referral-more">
            <a href="/">Learn more about Lana Insulation →</a>
          </p>
        </div>
      </section>
    </>
  );
}

function InvalidReferral() {
  return (
    <section className="container">
      <div className="referral-card referral-result">
        <div className="referral-result__icon" aria-hidden="true">
          ?
        </div>
        <h1 className="referral-title referral-title--sm">This Referral Link Isn’t Valid</h1>
        <p className="referral-lead">
          We couldn’t find that referral code. Ask the friend who sent it to double-check the link —
          it should end with a code like {referralConfig.codePrefix}-7KQ2DX.
        </p>
        <p className="referral-text">You can still get a free, no-pressure attic insulation quote.</p>
        <div className="referral-actions">
          <a className="btn btn--primary btn--lg btn--block" href="/#contact">
            Get a Free Quote
          </a>
          <a className="btn btn--ghost btn--lg btn--block" href="/">
            Visit Lana Insulation
          </a>
        </div>
      </div>
    </section>
  );
}
