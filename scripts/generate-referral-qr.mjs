// Writes the salesperson QR code (PNG for phones, SVG for print) pointing at
// the hidden sign-up page. Re-run with `npm run qr` if the domain or path in
// src/referralConfig.js changes — and reprint anything already printed.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';
import { registrationUrl } from '../src/referralConfig.js';

const outDir = new URL('../marketing/', import.meta.url);
const options = {
  errorCorrectionLevel: 'Q', // survives scuffed prints and screen glare
  margin: 4, // standard quiet zone
  color: { dark: '#1e2f4d', light: '#ffffff' }, // brand navy on white
};

await mkdir(outDir, { recursive: true });
await QRCode.toFile(fileURLToPath(new URL('referral-signup-qr.png', outDir)), registrationUrl, {
  ...options,
  width: 1200,
});
await writeFile(
  new URL('referral-signup-qr.svg', outDir),
  await QRCode.toString(registrationUrl, { ...options, type: 'svg' }),
);

console.log(`QR codes for ${registrationUrl} written to marketing/`);
