// Central settings for the referral program. Shared by the referral pages
// (src/referral/), the API functions (api/referrals/), the build and the QR
// script, so offer amounts, terms, contact details and URLs live only here.

// Unlisted sign-up page the salesperson's QR code opens. Never link to it.
// It's a separate export so it's tree-shaken out of every page bundle, and
// `npm run build` fails if it ever leaks into one. If you change it, also
// rename the folder at the project root, update vercel.json, run `npm run qr`
// and reprint any QR codes.
export const REGISTRATION_PATH = '/velvet-caribou-7nQ4pT9k2M';

// Every published version of the referral terms, newest last. The offer
// amounts (whole Canadian dollars) are set here: $75 for the referrer and $75
// off for the referred customer. Each sign-up records the version it accepted
// and these amounts, so once anyone has signed up under a version, never edit
// or delete it: to change an amount or the terms text, add a new entry with a
// new version and effective date. (Before launch it's fine to edit the entry
// below, e.g. to set the real effective date.)
export const termsVersions = [
  { version: '2026-10-18', effectiveDate: 'October 18, 2026', referrerReward: 75, friendDiscount: 75 },
];

export const currentTerms = termsVersions[termsVersions.length - 1];

export const referralConfig = {
  // Production domain, no trailing slash. lanainsulation.com redirects here.
  siteUrl: 'https://www.lanainsulation.com',

  // Friends open `${siteUrl}${referralPath}/WARM-XXXXXX`.
  referralPath: '/warmth',
  codePrefix: 'WARM',

  // Public Terms & Conditions page.
  termsPath: '/referral-terms',

  // The business number referred friends text (any North American format).
  businessTextNumber: '5067219278',

  // Offer amounts, from the current terms version above.
  referrerReward: currentTerms.referrerReward,
  friendDiscount: currentTerms.friendDiscount,

  // Rewards are paid within this many calendar days of all conditions being met.
  payoutDays: 30,
};

// Details shown on the Terms & Conditions page. Phone and email come from
// src/siteConfig.js. Leave an optional value as null and its line is simply
// left off the page. Never use placeholder text: `npm run build` fails on
// bracketed values like "[NAME]" so they can't reach the live site.
export const businessDetails = {
  // How referrer rewards are paid (used in the terms).
  payoutMethod: 'Interac e-Transfer',
  // Optional: registered legal name, if different from "Lana Insulation".
  legalName: null,
  // Optional: mailing address to list under "Contact us".
  mailingAddress: null,
  // Optional: path or URL of the site's Privacy Policy once one exists.
  privacyPolicyUrl: null,
};

export const isPlaceholder = (value) => typeof value === 'string' && /^\[.+\]$/.test(value);

export const dollars = (amount) => `$${amount}`;
export const cad = (amount) => `$${amount} CAD`;

export const referralUrl = (code) =>
  `${referralConfig.siteUrl}${referralConfig.referralPath}/${code}`;

export const registrationUrl = `${referralConfig.siteUrl}${REGISTRATION_PATH}`;

const reward = dollars(referralConfig.referrerReward);
const discount = dollars(referralConfig.friendDiscount);

// Shown next to the sign-up form's consent checkbox.
export const signupSummary =
  `Earn ${reward} for every eligible friend you refer who completes and fully pays for an attic ` +
  `insulation installation. Your friend receives ${discount} off their eligible installation. ` +
  'No reward is earned for assessments, quotes, cancellations, or unpaid jobs. Other conditions apply.';

// Shown directly below the offer on the referred friend's page.
export const friendSummary =
  `Your ${discount} discount applies to a qualifying attic insulation installation. Your referring ` +
  `friend may earn ${reward} when your installation is completed and fully paid. ` +
  'Eligibility and other conditions apply.';

// Key conditions repeated on the friend's page. A summary of the full terms
// page (src/referral/TermsPage.jsx), so keep the two in step.
export const friendTerms = [
  `${discount} off one qualifying attic insulation installation, shown on your written quote or invoice.`,
  'Share the referral code when you first contact us, before a quote is finalized. It’s already in the text message.',
  'For new customers who don’t already have a quote, booking or ongoing discussion with us for the same work.',
  'Not redeemable for cash, and can’t be combined with other promotions unless we approve it.',
  'Subject to our current service area. We’ll confirm whether we can serve your address.',
];
