import aboutCellulose from '../assets/about-cellulose.png';
import { aboutHighlights } from '../data.js';
import Media from './Media.jsx';

export default function About() {
  return (
    <section id="about" className="about">
      <div className="container about__inner">
        <div className="about__media">
          <Media
            src={aboutCellulose}
            alt="Hands holding a scoop of cellulose insulation"
            rounded
          />
        </div>
        <div>
          <span className="eyebrow">Your local experts</span>
          <h2 className="about__title">
            Your local attic insulation &amp; mold removal experts
          </h2>
          <p className="about__text">
            Lana Insulation is a student-run crew specializing in attic
            insulation and mold remediation. We help homeowners make their homes
            safer, more comfortable, and more energy-efficient — leading to real
            savings on heating and cooling costs. We know how to tackle common
            attic issues, whether it&apos;s improving insulation, removing mold,
            or clearing out debris, with reliable, high-quality results every
            time.
          </p>
          <div className="about__checks">
            {aboutHighlights.map((item) => (
              <span key={item} className="check">
                ✓ {item}
              </span>
            ))}
          </div>
          <a className="btn btn--gold btn--lg" href="#contact">
            Get a free quote
          </a>
        </div>
      </div>
    </section>
  );
}
