import { services } from '../data.js';
import Media from './Media.jsx';

export default function Services() {
  return (
    <section id="services" className="container services">
      <div className="section-head">
        <span className="eyebrow">What we do</span>
        <h2 className="section-title">Services built around your attic</h2>
      </div>
      <div className="services__grid">
        {services.map((service) => (
          <article key={service.id} className="service-card">
            <div className="service-card__media">
              <Media src={service.image} alt={service.alt} />
            </div>
            <div className="service-card__body">
              <h3 className="service-card__title">{service.title}</h3>
              <p className="service-card__text">{service.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
