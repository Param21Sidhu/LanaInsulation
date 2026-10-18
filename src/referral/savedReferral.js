// Remembers the last referral link created on this device so a homeowner who
// rescans the QR code sees their link again. A convenience only — the database
// is the real record. Holds nothing private: just the public link details.
import { normalizeReferralCode } from './validation.js';

const KEY = 'lana-referral';

export function loadSavedReferral() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && normalizeReferralCode(saved.code) === saved.code && typeof saved.url === 'string') {
      return { code: saved.code, url: saved.url, firstName: String(saved.firstName ?? '') };
    }
  } catch {
    // Storage blocked or corrupt — behave as a first visit.
  }
  return null;
}

export function saveReferral({ code, url, firstName }) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ code, url, firstName }));
  } catch {
    // Private mode etc. The success screen still works.
  }
  rememberOwnCode(code);
}

// Every code signed up on this device, so a referrer opening their own link
// can't claim the friend discount. Not cleared by "Sign up someone else".
// The server also sets a cookie for the same purpose (server/ownCodes.js).
const OWN_KEY = 'lana-referral-own';

function loadOwnCodes() {
  try {
    const codes = JSON.parse(localStorage.getItem(OWN_KEY));
    return Array.isArray(codes) ? codes.filter((code) => normalizeReferralCode(code) === code) : [];
  } catch {
    return [];
  }
}

function rememberOwnCode(code) {
  try {
    const codes = [...loadOwnCodes().filter((c) => c !== code), code].slice(-20);
    localStorage.setItem(OWN_KEY, JSON.stringify(codes));
  } catch {
    // Storage unavailable; the server cookie still covers this.
  }
}

export function isOwnCodeOnThisDevice(code) {
  return loadOwnCodes().includes(code) || loadSavedReferral()?.code === code;
}

export function clearSavedReferral() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}

// Unsent form, kept for this tab only, so reading the terms (or an accidental
// reload) doesn't wipe what the homeowner typed.
const DRAFT_KEY = 'lana-referral-draft';

export function loadDraft() {
  try {
    const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY));
    if (!draft || typeof draft !== 'object') return {};
    return {
      name: String(draft.name ?? ''),
      email: String(draft.email ?? ''),
      phone: String(draft.phone ?? ''),
      acceptedTerms: draft.acceptedTerms === true,
    };
  } catch {
    return {};
  }
}

export function saveDraft({ name, email, phone, acceptedTerms }) {
  try {
    if (name || email || phone || acceptedTerms) {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ name, email, phone, acceptedTerms }));
    } else {
      sessionStorage.removeItem(DRAFT_KEY);
    }
  } catch {
    // Storage unavailable; the form still works.
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Nothing to clear.
  }
}
