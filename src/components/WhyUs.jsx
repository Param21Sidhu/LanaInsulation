import { benefits } from '../data.js';

export default function WhyUs() {
  return (
    <section id="why" className="why">
      <div className="container why__inner">
        <div>
          <span className="eyebrow">Why choose us</span>
          <h2 className="why__title">
            Big-company work, without the big-company markup.
          </h2>
          <p className="why__lead">
            We&apos;re a hard-working student crew that takes insulation
            seriously. You get careful, thorough work and a fair price — every
            quote is free, with no pressure to book.
          </p>
        </div>
        <div className="why__grid">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="benefit">
              <div className="benefit__title">{benefit.title}</div>
              <p className="benefit__text">{benefit.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
