// A referrer's personal link with Copy and Share buttons. Used on the sign-up
// success screen and when a referrer opens their own link.
import { useRef, useState } from 'react';
import { dollars, referralConfig } from '../referralConfig.js';
import { IconCheck, IconCopy, IconShare } from './icons.jsx';
import { useCopy } from './useCopy.js';

const discount = dollars(referralConfig.friendDiscount);

// The link goes inside the text itself. Passed as a separate `url`, some
// messaging apps drop it and the friend receives a message with no link.
export function shareMessage(url) {
  return `Get ${discount} off a qualifying attic insulation installation with Lana Insulation. Use my referral link: ${url}`;
}

export default function ShareLink({ url }) {
  const linkRef = useRef(null);
  const [copyStatus, copy] = useCopy();
  const [note, setNote] = useState('');

  const copyLink = async () => {
    const copied = await copy(url);
    setNote(copied ? 'Link copied. Paste it into a text, email or post.' : 'Press and hold the link above to copy it.');
    if (!copied) linkRef.current?.select();
  };

  const shareLink = async () => {
    const shareData = { title: 'Lana Insulation referral', text: shareMessage(url) };
    if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
      try {
        await navigator.share(shareData);
        setNote('');
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return; // They closed the share sheet.
      }
    }
    const copied = await copy(shareMessage(url));
    setNote(
      copied
        ? 'Sharing isn’t available here, so we copied a ready-to-send message with your link. Paste it into a text, email or post.'
        : 'Press and hold the link above to copy it, then paste it into a message.',
    );
    if (!copied) linkRef.current?.select();
  };

  return (
    <>
      <label className="copy-label" htmlFor="referral-link">
        Your personal referral link
      </label>
      {/* A textarea so the full link wraps on narrow phones instead of being cut off. */}
      <textarea
        id="referral-link"
        ref={linkRef}
        className="copy-input"
        readOnly
        rows={2}
        value={url}
        onFocus={(event) => event.target.select()}
      />

      <div className="referral-actions referral-actions--row">
        <button type="button" className="btn btn--primary btn--lg btn--block" onClick={copyLink}>
          {copyStatus === 'copied' ? <IconCheck /> : <IconCopy />}
          {copyStatus === 'copied' ? 'Copied!' : 'Copy Referral Link'}
        </button>
        <button type="button" className="btn btn--gold btn--lg btn--block" onClick={shareLink}>
          <IconShare />
          Share With Friends
        </button>
      </div>
      <p className="action-note" aria-live="polite">
        {note}
      </p>
    </>
  );
}
