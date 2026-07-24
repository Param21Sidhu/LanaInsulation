import howItWorks from '../assets/how-it-works.png';
import { steps } from '../data.js';
import Media from './Media.jsx';

export default function HowItWorks() {
  return (
    <section id="how" className="container how">
      <div className="how__inner">
        <div>
          <span className="eyebrow">How we operate</span>
          <h2 className="how__title">How it works</h2>
          <div className="steps">
            {steps.map((step) => (
              <div key={step.n} className="step">
                <div className="step__num">{step.n}</div>
                <div>
                  <h3 className="step__title">{step.title}</h3>
                  <p className="step__text">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="how__media">
          <Media
            src={howItWorks}
            alt="Installer spraying blown-in insulation in an attic"
            rounded
          />
        </div>
      </div>
    </section>
  );
}
