import Logo from './Logo.jsx';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a href="#top" aria-label="Lana Insulation — home">
          <Logo />
        </a>
        <nav className="site-nav">
          <a className="site-nav__link" href="#services">
            Services
          </a>
          <a className="site-nav__link" href="#why">
            Why us
          </a>
          <a className="site-nav__link" href="#how">
            How it works
          </a>
          <a className="site-nav__link" href="#faq">
            FAQ
          </a>
          <a className="btn btn--primary" href="#contact">
            Get a free quote
          </a>
        </nav>
      </div>
    </header>
  );
}
