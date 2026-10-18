import { useCallback, useEffect, useRef, useState } from 'react';

// Clipboard API where available, with a hidden-textarea fallback for older
// browsers and in-app browsers (Instagram, Facebook) that block it.
export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy approach.
  }

  const previousFocus = document.activeElement;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  // 16px stops iOS from zooming; fixed + transparent keeps the page still.
  textarea.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px;';
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, text.length);
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  textarea.remove();
  previousFocus?.focus?.();
  return copied;
}

// Returns [status, copy] where status is 'idle' | 'copied' | 'failed' and
// resets to 'idle' a few seconds after each copy.
export function useCopy() {
  const [status, setStatus] = useState('idle');
  const timer = useRef();

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async (text) => {
    const copied = await copyText(text);
    setStatus(copied ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), 3000);
    return copied;
  }, []);

  return [status, copy];
}
