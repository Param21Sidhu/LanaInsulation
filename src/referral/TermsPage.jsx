// Public Referral Program Terms & Conditions: /referral-terms.
// Amounts, payout timing and business details come from src/referralConfig.js.
// If you change the substance of these terms after launch, add a new entry to
// termsVersions there so existing sign-ups keep the version they accepted.
import { useState } from 'react';
import { businessDetails, cad, currentTerms, isPlaceholder, referralConfig } from '../referralConfig.js';
import { siteConfig } from '../siteConfig.js';
import ReferralLayout from './ReferralLayout.jsx';
import { businessTextNumber } from './sms.js';

const reward = cad(referralConfig.referrerReward);
const discount = cad(referralConfig.friendDiscount);
const { payoutDays } = referralConfig;
const siteHost = referralConfig.siteUrl.replace(/^https?:\/\//, '');

// Unfilled config values are highlighted so they're obvious in review.
function Detail({ value }) {
  return isPlaceholder(value) ? <mark className="placeholder">{value}</mark> : value;
}

// If a referral page opened this one, offer a way back to it. Uses the
// referrer instead of a hard-coded link so this public page never contains the
// unlisted sign-up URL.
function getReturnLink() {
  try {
    const from = new URL(document.referrer);
    const { pathname } = from;
    if (from.origin !== window.location.origin) return null;
    if (pathname === '/' || pathname.startsWith(referralConfig.termsPath)) return null;
    const isOffer = pathname.startsWith(`${referralConfig.referralPath}/`);
    return { href: from.href, label: isOffer ? 'Back to your referral offer' : 'Back to referral sign-up' };
  } catch {
    return null;
  }
}

function ReturnLink({ link }) {
  if (!link) return null;
  const goBack = (event) => {
    event.preventDefault();
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    // Opened in a new tab from the sign-up form: closing it reveals the form
    // as it was left. If the browser won't close the tab, go to the page.
    window.close();
    window.setTimeout(() => window.location.assign(link.href), 250);
  };
  return (
    <a className="terms-back" href={link.href} onClick={goBack}>
      ← {link.label}
    </a>
  );
}

function Section({ n, id, title, children }) {
  return (
    <section className="terms-section" id={id} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="terms-h2">
        <span className="terms-h2__num">{n}.</span> {title}
      </h2>
      {children}
    </section>
  );
}

export default function TermsPage() {
  const [returnLink] = useState(getReturnLink);
  const showTextLine = businessTextNumber.display !== siteConfig.phoneDisplay;

  return (
    <ReferralLayout>
      <article className="container terms-page">
        <ReturnLink link={returnLink} />

        <header className="terms-head">
          <span className="eyebrow">{siteConfig.name}</span>
          <h1 className="referral-title">Referral Program — Terms &amp; Conditions</h1>
          <p className="terms-meta">
            Effective and last updated {currentTerms.effectiveDate} · Version {currentTerms.version}
          </p>
          <p className="referral-lead">
            Recommend us to friends and family. When someone you refer completes and fully pays
            for a qualifying attic insulation installation, you earn {reward} and they get{' '}
            {discount} off that installation.
          </p>
        </header>

        <section className="terms-how" aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="terms-h2">
            How it works
          </h2>
          <ol className="how-steps">
            <li>
              <strong>Sign up for free.</strong> Register using the referral sign-up link our team
              gives you to get your personal referral link and code. No purchase is needed.
            </li>
            <li>
              <strong>Share your link.</strong> Send it to friends, family or other homeowners who
              might benefit.
            </li>
            <li>
              <strong>Your friend contacts us.</strong> Your link opens a text message to us with
              your referral code already in it. They can request a free assessment and get{' '}
              {discount} off a qualifying installation.
            </li>
            <li>
              <strong>You earn {reward}.</strong> After their installation is completed and fully
              paid and we’ve verified the referral, we pay your reward within {payoutDays} days.
            </li>
          </ol>
        </section>

        <Section n={1} id="overview" title="Program overview">
          <p>
            The {siteConfig.name} referral program rewards people who recommend our attic
            insulation services to friends, family or other eligible homeowners.
          </p>
          <p>
            When a qualifying referred customer completes and fully pays for an eligible attic
            insulation installation:
          </p>
          <ul>
            <li>the referrer earns {reward}; and</li>
            <li>the referred customer receives {discount} off that qualifying installation.</li>
          </ul>
          <p>Participation is voluntary and subject to these terms.</p>
        </Section>

        <Section n={2} id="eligibility" title="Who can participate">
          <ul>
            <li>Referrers must be at least 18 years old and provide accurate registration details.</li>
            <li>Existing customers and other eligible individuals may participate.</li>
            <li>
              Registration is free. Referrers don’t need to buy insulation services themselves.
            </li>
            <li>
              The referred customer must be a new customer for the installation project. They must
              not already have an active quote, booking or ongoing sales discussion with us for
              the same work before the referral.
            </li>
            <li>
              The referred customer must be legally authorized to approve the work at the service
              property.
            </li>
            <li>
              The property must be in an area we currently serve. We’ll confirm whether we can
              serve an address when the referred customer contacts us.
            </li>
          </ul>
        </Section>

        <Section n={3} id="valid-referral" title="How to make a valid referral">
          <ol>
            <li>
              Register using the referral sign-up link provided by our team to receive your unique
              referral code and personal link.
            </li>
            <li>Share your personal link with others.</li>
            <li>
              The referred customer must use your link, or give us your referral code, when they
              first contact us and before a quote or installation agreement is finalized. Texting
              us through your link includes your code automatically.
            </li>
            <li>We use the referral code to identify the person who made the referral.</li>
          </ol>
          <p>
            A referral isn’t confirmed just because someone opens a link or sends a text message.
            We confirm each referral after reviewing it.
          </p>
          <p>
            If more than one person claims the same customer or installation, we’ll normally
            recognize the first valid, verifiable referral we recorded.
          </p>
        </Section>

        <Section n={4} id="discount" title={`The referred customer’s ${discount} discount`}>
          <ul>
            <li>The referred customer receives {discount} off one qualifying attic insulation installation.</li>
            <li>The discount will be shown on the written quote or invoice.</li>
            <li>It applies only when the installation meets this program’s eligibility requirements.</li>
            <li>It can’t be exchanged for cash.</li>
            <li>It can’t be combined with another promotion unless we explicitly approve it.</li>
            <li>Requesting a free assessment doesn’t by itself earn a discount.</li>
          </ul>
        </Section>

        <Section n={5} id="reward" title={`When the referrer earns ${reward}`}>
          <p>A referral becomes eligible for the {reward} reward only when all of the following are true:</p>
          <ol>
            <li>The referred customer meets the eligibility requirements.</li>
            <li>A qualifying insulation installation is completed.</li>
            <li>We have received full payment for that installation.</li>
            <li>
              The installation hasn’t been cancelled or refunded, and no cancellation or refund
              issue remains unresolved.
            </li>
            <li>We have verified the referral as legitimate.</li>
          </ol>
          <p>
            Requesting a quote, attending an assessment or booking an installation doesn’t by
            itself earn a reward.
          </p>
          <p>
            <strong>Payment:</strong> we pay rewards by <Detail value={businessDetails.payoutMethod} />{' '}
            within {payoutDays} calendar days after all of the conditions above are met. Rewards are
            paid manually; we’ll contact you using the details you registered with.
          </p>
        </Section>

        <Section n={6} id="multiple" title="Multiple referrals">
          <ul>
            <li>You can refer more than one eligible customer.</li>
            <li>
              Each separate qualifying installation that is completed and fully paid can earn an
              additional {reward} reward.
            </li>
            <li>
              There’s no general limit on the number of legitimate referrals, unless a future
              published promotion says otherwise.
            </li>
            <li>Each installation can be linked to only one qualifying referrer.</li>
          </ul>
        </Section>

        <Section n={7} id="exclusions" title="Exclusions and misuse">
          <ul>
            <li>Self-referrals aren’t eligible.</li>
            <li>Duplicate, fabricated, misleading or fraudulent referrals aren’t eligible.</li>
            <li>
              You can’t receive a reward for referring work on a property you own or for which you
              are the purchasing customer.
            </li>
            <li>
              {siteConfig.name} employees and sales representatives can’t earn personal referral
              rewards unless separately authorized under a disclosed program.
            </li>
            <li>Cancelled, unpaid or fully refunded installations don’t qualify for referral rewards.</li>
            <li>
              We may investigate referrals and reject those where there is reasonable evidence of
              fraud or a material breach of these terms. We’ll explain our decision on request.
            </li>
          </ul>
        </Section>

        <Section n={8} id="changes" title="Changes to the program">
          <ul>
            <li>We may update or end the program going forward, subject to applicable law.</li>
            <li>Any changes will be published on this page with a new effective date.</li>
            <li>
              Valid referrals registered before a change remain subject to the terms in force when
              they were registered, as long as they go on to meet those terms.
            </li>
            <li>We won’t reduce a reward that has already been legitimately earned.</li>
          </ul>
        </Section>

        <Section n={9} id="privacy" title="Privacy and your information">
          <ul>
            <li>
              <strong>What we collect:</strong> your name, email address, optional phone number,
              referral code, registration date, and the version of these terms you accepted.
            </li>
            <li>
              <strong>How we use it:</strong> to run the referral program, verify referrals,
              contact you about referral rewards and prevent misuse.
            </li>
            <li>
              <strong>What others see:</strong> people who open your referral link see your first
              name and referral code, and both are included in the text message they send us. We
              never publicly display your email address or phone number.
            </li>
            <li>
              <strong>No marketing sign-up:</strong> joining the program doesn’t subscribe you to
              promotional emails or text messages.
            </li>
            <li>
              <strong>Questions or requests:</strong> to ask about your information, or to access
              or correct it, email us at <a href={siteConfig.mailHref}>{siteConfig.email}</a>.
            </li>
          </ul>
          {businessDetails.privacyPolicyUrl && (
            <p>
              For more detail, see our <a href={businessDetails.privacyPolicyUrl}>Privacy Policy</a>.
            </p>
          )}
        </Section>

        <Section n={10} id="consumer-rights" title="Your consumer rights">
          <ul>
            <li>
              Taking part in the referral program doesn’t remove or reduce any rights you have under
              applicable law.
            </li>
            <li>
              Any attic insulation installation contract remains subject to applicable statutory
              consumer protections, including any legally required cancellation rights.
            </li>
            <li>
              These referral terms don’t replace a proper installation contract, a statutory
              cancellation notice, or any applicable direct-selling licensing obligations.
            </li>
          </ul>
        </Section>

        <Section n={11} id="contact" title="Contact us">
          <p>Questions about the program, a referral or a reward? Get in touch:</p>
          <dl className="terms-contact">
            <dt>Business</dt>
            <dd>{siteConfig.name}</dd>
            <dt>Legal business name</dt>
            <dd>
              <Detail value={businessDetails.legalName} />
            </dd>
            <dt>Email</dt>
            <dd>
              <a href={siteConfig.mailHref}>{siteConfig.email}</a>
            </dd>
            <dt>Phone</dt>
            <dd>
              <a href={siteConfig.telHref}>{siteConfig.phoneDisplay}</a>
            </dd>
            {showTextLine && (
              <>
                <dt>Referral text line</dt>
                <dd>
                  {businessTextNumber.configured ? (
                    businessTextNumber.display
                  ) : (
                    <mark className="placeholder">{businessTextNumber.display}</mark>
                  )}
                </dd>
              </>
            )}
            <dt>Mailing address</dt>
            <dd>
              <Detail value={businessDetails.mailingAddress} />
            </dd>
            <dt>Website</dt>
            <dd>
              <a href="/">{siteHost}</a>
            </dd>
          </dl>
        </Section>

        <ReturnLink link={returnLink} />
      </article>
    </ReferralLayout>
  );
}
