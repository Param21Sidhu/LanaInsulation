// Second build pass: the referral pages (sign-up, referred friend, terms).
// `npm run build` builds the main site with vite.config.js first, then this
// config writes the referral pages into the same dist/. Keeping them separate
// means the main site's bundle is exactly what it would be without them.
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {
  businessDetails,
  isPlaceholder,
  REGISTRATION_PATH,
  referralConfig,
} from './src/referralConfig.js';
import { toE164 } from './src/referral/validation.js';

const page = (path) => fileURLToPath(new URL(path, import.meta.url));
const { referralPath, termsPath } = referralConfig;

// Serve the referral pages at their real URLs in `vite dev` / `vite preview`.
// In production, vercel.json does the same with rewrites.
export function referralRoutes() {
  const exactPages = new Set([REGISTRATION_PATH, termsPath]);
  const rewrite = (req, _res, next) => {
    const [pathname, search] = req.url.split('?');
    const query = search ? `?${search}` : '';
    const bare = pathname.replace(/\/$/, '');
    if (exactPages.has(bare)) {
      req.url = `${bare}/index.html${query}`;
    } else if (pathname.startsWith(`${referralPath}/`) && !pathname.endsWith('.html')) {
      req.url = `${referralPath}/index.html${query}`;
    }
    next();
  };
  // Block bodies on purpose: Vite treats a function returned from these hooks
  // as a post-middleware hook and calls it.
  return {
    name: 'referral-routes',
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

// The sign-up URL must stay unlisted: fail the build if it ends up in any
// public JS or CSS file. Read-only, so it never changes the output.
export function unlistedPathGuard() {
  return {
    name: 'referral-unlisted-path-guard',
    apply: 'build',
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (!/\.(js|css)$/.test(file.fileName)) continue;
        const source = file.type === 'chunk' ? file.code : String(file.source);
        if (source.includes(REGISTRATION_PATH)) {
          this.error(
            `The unlisted sign-up path leaked into ${file.fileName}. ` +
              'Only build scripts may import REGISTRATION_PATH / registrationUrl.',
          );
        }
      }
    },
  };
}

// Unfinished business details must never reach the live site: fail the build
// on placeholder text, a missing payout method or an invalid texting number.
function noPlaceholders() {
  return {
    name: 'referral-no-placeholders',
    apply: 'build',
    buildStart() {
      const problems = [];
      if (!toE164(referralConfig.businessTextNumber)) problems.push('referralConfig.businessTextNumber is not a valid phone number');
      if (!businessDetails.payoutMethod) problems.push('businessDetails.payoutMethod is empty');
      for (const [key, value] of Object.entries(businessDetails)) {
        if (isPlaceholder(value)) problems.push(`businessDetails.${key} is placeholder text (${value})`);
      }
      if (problems.length) this.error(`Fix src/referralConfig.js before building: ${problems.join('; ')}`);
    },
  };
}

export default defineConfig({
  plugins: [react(), noPlaceholders(), unlistedPathGuard()],
  build: {
    emptyOutDir: false, // the main site build has just filled dist/
    copyPublicDir: false, // already copied by the main site build
    rollupOptions: {
      input: {
        'referral-signup': page(`.${REGISTRATION_PATH}/index.html`),
        'referral-friend': page(`.${referralPath}/index.html`),
        'referral-terms': page(`.${termsPath}/index.html`),
      },
    },
  },
});
