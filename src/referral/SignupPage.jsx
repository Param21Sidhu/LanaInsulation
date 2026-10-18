// Unlisted referral sign-up page, opened from the salesperson's QR code.
// Form -> success screen with the homeowner's personal link, or a recovery
// screen if the email is already registered.
import { useEffect, useRef, useState } from 'react';
import {
  businessDetails,
  currentTerms,
  dollars,
  referralConfig,
  signupSummary,
} from '../referralConfig.js';
import { siteConfig } from '../siteConfig.js';
import { IconCheck, IconMessage } from './icons.jsx';
import ReferralLayout from './ReferralLayout.jsx';
import ShareLink from './ShareLink.jsx';
import { lookupCode } from './lookupCode.js';
import {
  clearDraft,
  clearSavedReferral,
  forgetOwnCode,
  loadDraft,
  loadSavedReferral,
  saveDraft,
  saveReferral,
} from './savedReferral.js';
import { smsHref } from './sms.js';
import { FIELD_ORDER, formatPhoneInput, validateRegistration } from './validation.js';

const reward = dollars(referralConfig.referrerReward);
const discount = dollars(referralConfig.friendDiscount);
const { termsPath } = referralConfig;
const privacyHref = businessDetails.privacyPolicyUrl ?? `${termsPath}#privacy`;

const EMPTY_FORM = { name: '', email: '', phone: '', acceptedTerms: false, hp: '' };

export default function SignupPage() {
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM, ...loadDraft() }));
  const [referral, setReferral] = useState(loadSavedReferral);
  const [justRegistered, setJustRegistered] = useState(false);
  const [existingEmail, setExistingEmail] = useState('');
  const [notice, setNotice] = useState('');
  const restoredCode = useRef(referral?.code);

  useEffect(() => {
    saveDraft(form);
  }, [form]);

  // A link remembered on this device may since have been deleted from the
  // database. If so, forget it and show the sign-up form again.
  useEffect(() => {
    const code = restoredCode.current;
    if (!code) return undefined;
    let active = true;
    lookupCode(code, { own: true }).then((result) => {
      if (!active || result.status !== 'missing') return;
      forgetOwnCode(code);
      setReferral((current) => (current?.code === code ? null : current));
      setNotice('Your previous referral link is no longer active. Sign up below to get a new one.');
    });
    return () => {
      active = false;
    };
  }, []);

  const handleRegistered = (result) => {
    clearDraft();
    saveReferral(result);
    setReferral(result);
    setJustRegistered(true);
  };

  const startOver = () => {
    clearSavedReferral();
    clearDraft();
    setReferral(null);
    setJustRegistered(false);
    setForm(EMPTY_FORM);
  };

  let content;
  if (referral) {
    content = (
      <SuccessView referral={referral} justRegistered={justRegistered} onStartOver={startOver} />
    );
  } else if (existingEmail) {
    content = <AlreadyRegisteredView email={existingEmail} onBack={() => setExistingEmail('')} />;
  } else {
    content = (
      <SignupForm
        form={form}
        setForm={setForm}
        notice={notice}
        onRegistered={handleRegistered}
        onAlreadyRegistered={setExistingEmail}
      />
    );
  }

  return <ReferralLayout>{content}</ReferralLayout>;
}

async function postJson(url, body, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    return { status: response.status, data };
  } finally {
    clearTimeout(timer);
  }
}

function SignupForm({ form, setForm, notice, onRegistered, onAlreadyRegistered }) {
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fieldRefs = useRef({});

  const refFor = (key) => (element) => {
    fieldRefs.current[key] = element;
  };

  const update = (key, format = (value) => value) => (event) => {
    const { type, checked, value } = event.target;
    setForm((prev) => ({ ...prev, [key]: type === 'checkbox' ? checked : format(value) }));
    if (errors[key]) setErrors(({ [key]: _cleared, ...rest }) => rest);
  };

  const showErrors = (found) => {
    setErrors(found);
    const first = FIELD_ORDER.find((key) => found[key]);
    if (first) fieldRefs.current[first]?.focus();
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setFormError('');

    // The terms version this page linked to is what the person is agreeing to.
    const payload = { ...form, termsVersion: currentTerms.version };
    const { errors: found } = validateRegistration(payload);
    if (Object.keys(found).length) {
      showErrors(found);
      return;
    }

    setSubmitting(true);
    try {
      const { status, data } = await postJson('/api/referrals/register', payload);
      if (status === 201 && data?.code) {
        onRegistered({ code: data.code, url: data.url, firstName: data.firstName });
      } else if (status === 409) {
        onAlreadyRegistered(form.email.trim().toLowerCase());
      } else if (status === 400 && data?.fields) {
        showErrors(data.fields);
      } else if (status === 429) {
        setFormError('Too many sign-up attempts from this connection. Please wait a few minutes and try again.');
      } else {
        setFormError('Sorry — we couldn’t create your link right now. Please try again in a moment.');
      }
    } catch {
      setFormError('We couldn’t reach our server. Check your internet connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="container referral-intro">
        <span className="badge">
          <span className="badge__dot" />
          Lana Insulation referral program
        </span>
        <h1 className="referral-title">
          Give Your Friends {discount} Off. Earn {reward} for Every Successful Referral.
        </h1>
        <p className="referral-lead">
          Share attic insulation savings with friends and family. When someone you refer
          completes and fully pays for a qualifying insulation installation, you earn {reward}.
        </p>
        <div className="offer-grid">
          <div className="offer">
            <div className="offer__amount">{discount} off</div>
            <div className="offer__label">for each friend you refer, on an eligible installation</div>
          </div>
          <div className="offer offer--dark">
            <div className="offer__amount">{reward}</div>
            <div className="offer__label">for you, each time a friend’s installation is completed and fully paid</div>
          </div>
        </div>
      </section>

      <section className="container">
        <form className="form referral-form" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
          {notice && !formError && (
            <div className="form-notice" role="status">
              {notice}
            </div>
          )}
          {formError && (
            <div className="form-alert" role="alert">
              {formError}
            </div>
          )}

          <TextField
            id="ref-name"
            label="Full name"
            value={form.name}
            onChange={update('name')}
            error={errors.name}
            inputRef={refFor('name')}
            autoComplete="name"
            autoCapitalize="words"
            enterKeyHint="next"
            maxLength={100}
            required
          />
          <TextField
            id="ref-email"
            label="Email address"
            type="email"
            inputMode="email"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
            inputRef={refFor('email')}
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="next"
            maxLength={254}
            required
          />
          <TextField
            id="ref-phone"
            label="Phone number"
            type="tel"
            inputMode="tel"
            placeholder="10-digit phone number"
            value={form.phone}
            onChange={update('phone', formatPhoneInput)}
            error={errors.phone}
            inputRef={refFor('phone')}
            autoComplete="tel"
            enterKeyHint="done"
            maxLength={30}
            required
          />

          {/* Honeypot: invisible to people and screen readers; bots fill it in. */}
          <div className="hp-field" aria-hidden="true">
            <label htmlFor="ref-hp">Leave this field empty</label>
            <input id="ref-hp" tabIndex={-1} autoComplete="off" value={form.hp} onChange={update('hp')} />
          </div>

          <div className="conditions-box">
            <p className="conditions-box__title">Before you join</p>
            <p>{signupSummary}</p>
            <p>
              You must be 18 or older to join, and self-referrals don’t qualify. People who open
              your link see your first name and referral code, and both are included in the text
              message they send us.
            </p>
          </div>

          {/* Must stay unchecked by default and directly above the submit button. */}
          <div className="consent-block">
            <label className="consent" htmlFor="ref-terms">
              <input
                id="ref-terms"
                type="checkbox"
                checked={form.acceptedTerms}
                onChange={update('acceptedTerms')}
                ref={refFor('acceptedTerms')}
                aria-invalid={errors.acceptedTerms ? 'true' : undefined}
                aria-describedby={errors.acceptedTerms ? 'ref-terms-error' : undefined}
                required
              />
              <span>
                I have read and agree to the{' '}
                {/* New tab keeps this form exactly as it is. */}
                <a href={termsPath} target="_blank" rel="noopener">
                  Referral Program Terms &amp; Conditions
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
                .
              </span>
            </label>
            {errors.acceptedTerms && (
              <p id="ref-terms-error" className="field__error">
                {errors.acceptedTerms}
              </p>
            )}
          </div>

          <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Creating your link…
              </>
            ) : (
              'Get My Referral Link'
            )}
          </button>

          <p className="privacy-note">
            <strong>Your privacy:</strong> we use your name, email and phone number only to run
            the referral program: to verify referrals, contact you about rewards and
            prevent misuse. We never show your email or phone number to the people you refer,
            and joining doesn’t sign you up for marketing emails or texts.{' '}
            <a href={privacyHref} target="_blank" rel="noopener">
              {businessDetails.privacyPolicyUrl ? 'Privacy Policy' : 'How we handle your information'}
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </p>
        </form>
      </section>
    </>
  );
}

function TextField({ id, label, error, inputRef, ...inputProps }) {
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        ref={inputRef}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}

// Moves screen-reader and keyboard focus to a new view's heading.
function useFocusOnMount(enabled = true) {
  const ref = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    window.scrollTo(0, 0);
    ref.current?.focus({ preventScroll: true });
  }, [enabled]);
  return ref;
}

function SuccessView({ referral, justRegistered, onStartOver }) {
  const headingRef = useFocusOnMount(justRegistered);

  return (
    <section className="container">
      <div className="referral-card referral-result">
        <div className="referral-result__icon referral-result__icon--success" aria-hidden="true">
          <IconCheck />
        </div>
        {!justRegistered && referral.firstName && (
          <span className="eyebrow">Welcome back, {referral.firstName}</span>
        )}
        <h1 ref={headingRef} tabIndex={-1} className="referral-title referral-title--sm">
          You’re In! Your Referral Link Is Ready.
        </h1>
        <p className="referral-lead">
          Share your link with friends. They’ll get {discount} off a qualifying attic insulation
          installation, and you’ll earn {reward} when their installation is completed and fully
          paid.
        </p>

        <ShareLink url={referral.url} />

        <div className="code-box">
          <span className="code-box__label">Your referral code</span>
          <span className="code-box__code">{referral.code}</span>
        </div>

        <ol className="mini-steps">
          <li>Send your link to friends and family.</li>
          <li>They tap the button on your link to text us. Your code is included automatically.</li>
          <li>
            Once their installation is completed and fully paid and we’ve verified the referral,
            we send your {reward} by {businessDetails.payoutMethod} to the email you signed up with.
          </li>
        </ol>

        <p className="save-tip">
          <strong>Save your link:</strong> bookmark this page or text the link to yourself so
          it’s easy to find later. See the{' '}
          <a href={termsPath} target="_blank" rel="noopener">
            full program terms
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
          .
        </p>
        <button type="button" className="link-button" onClick={onStartOver}>
          Sign up someone else
        </button>
      </div>
    </section>
  );
}

function AlreadyRegisteredView({ email, onBack }) {
  const headingRef = useFocusOnMount();
  // Plain GSM-7 text (no curly quotes) so it stays a short SMS.
  const message =
    `Hi! I already signed up for the Lana Insulation referral program with ${email}. ` +
    'Could you please resend my referral link? Thanks!';
  const mailHref =
    `${siteConfig.mailHref}?subject=${encodeURIComponent('Resend my referral link')}` +
    `&body=${encodeURIComponent(message)}`;

  return (
    <section className="container">
      <div className="referral-card referral-result">
        <div className="referral-result__icon" aria-hidden="true">
          <IconMessage />
        </div>
        <h1 ref={headingRef} tabIndex={-1} className="referral-title referral-title--sm">
          You’re Already Registered
        </h1>
        <p className="referral-lead">
          <strong className="break-anywhere">{email}</strong> is already in our referral program,
          and the referral link created for it still works.
        </p>
        <p className="referral-text">
          To protect your privacy, we don’t show referral links to anyone who simply types in an
          email address. Message us and we’ll send your link to the email or phone number you
          signed up with.
        </p>
        <div className="referral-actions">
          <a className="btn btn--primary btn--lg btn--block" href={smsHref(message)}>
            <IconMessage />
            Text Us to Resend My Link
          </a>
          <a className="btn btn--ghost btn--lg btn--block" href={mailHref}>
            Email {siteConfig.email}
          </a>
        </div>
        <button type="button" className="link-button" onClick={onBack}>
          Use a different email
        </button>
      </div>
    </section>
  );
}
