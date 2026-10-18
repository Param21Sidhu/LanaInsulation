import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { referralRoutes, unlistedPathGuard } from './vite.referral.config.js';

// Main site. The referral pages are built by a second pass
// (vite.referral.config.js) so they never change this bundle; `npm run build`
// runs both. The dev server serves everything, referral pages included.
export default defineConfig({
  plugins: [react(), referralRoutes(), unlistedPathGuard()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
