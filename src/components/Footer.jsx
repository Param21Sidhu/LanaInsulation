import { siteConfig } from '../siteConfig.js';
import Logo from './Logo.jsx';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <Logo variant="boxed" />
        <div className="site-footer__links">
          <a href={siteConfig.telHref}>{siteConfig.phoneDisplay}</a>
          <a href={siteConfig.mailHref}>{siteConfig.email}</a>
        </div>
        <div className="site-footer__legal">
          © {year} Lana Insulation — a student-run insulation crew. *Savings
          vary by home. Free quotes, always.
        </div>
      </div>
    </footer>
  );
}
