import { siteConfig } from '../siteConfig.js';

// Decorative "insulation layers" inside the illustrated house.
const barColors = ['#c19a5b', '#9fb0cc', '#1e2f4d', '#9fb0cc', '#c19a5b'];

export default function Hero() {
  return (
    <section id="top" className="container hero">
      <div>
        <span className="badge">
          <span className="badge__dot" />
          Local &amp; student-run — free quotes
        </span>
        <h1 className="hero__title">A warmer home, a smaller energy bill.</h1>
        <p className="hero__lead">
          Lana Insulation keeps your attic sealed tight — so heat stays in,
          drafts stay out, and you pay less every month. Honest work at
          student-friendly prices.
        </p>
        <div className="hero__actions">
          <a className="btn btn--primary btn--lg" href="#contact">
            Get my free quote
          </a>
          <a className="btn btn--ghost btn--lg" href={siteConfig.telHref}>
            Call {siteConfig.phoneDisplay}
          </a>
        </div>
        <div className="hero__points">
          <span>✓ Free, no-pressure quotes</span>
          <span>✓ Lower energy bills</span>
          <span>✓ Reliable &amp; local</span>
        </div>
      </div>

      <div className="hero__visual">
        <div className="hero__frame">
          <div className="hero__glow" />
          <div className="hero__house">
            <div className="hero__house-inner">
              <div className="hero__roof" />
              <div className="hero__panel">
                {barColors.map((color, i) => (
                  <div
                    key={i}
                    className="hero__bar"
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="hero__stat">
          <div className="hero__stat-num">Up to 20%</div>
          <div className="hero__stat-label">off yearly heating costs*</div>
        </div>
      </div>
    </section>
  );
}
