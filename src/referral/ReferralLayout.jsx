import Footer from '../components/Footer.jsx';
import Logo from '../components/Logo.jsx';

// Shared shell for the referral pages: the site's header (logo only, no
// navigation, not sticky) and the regular footer.
export default function ReferralLayout({ children }) {
  return (
    <div className="referral-page">
      <header className="site-header referral-header">
        <div className="container site-header__inner">
          <a href="/" aria-label="Lana Insulation — home">
            <Logo />
          </a>
        </div>
      </header>
      <main className="referral">{children}</main>
      <Footer />
    </div>
  );
}
