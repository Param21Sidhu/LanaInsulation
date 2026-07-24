import { useState } from 'react';
import { siteConfig } from '../siteConfig.js';

const EMPTY_FORM = { name: '', phone: '', email: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [sentName, setSentName] = useState('');

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    setSentName(form.name.trim() || 'there');
    setSubmitted(true);
  };

  return (
    <section id="contact" className="contact">
      <div className="container contact__inner">
        <div>
          <span className="eyebrow">Free quote</span>
          <h2 className="contact__title">Let&apos;s warm up your home</h2>
          <p className="contact__lead">
            Tell us a bit about your attic and we&apos;ll get back to you with a
            free, honest quote — usually within a day.
          </p>
          <div className="contact__methods">
            <a className="contact-method" href={siteConfig.telHref}>
              <span className="contact-method__icon">📞</span>
              <span>
                <span className="contact-method__label">Call or text</span>
                <span className="contact-method__value">
                  {siteConfig.phoneDisplay}
                </span>
              </span>
            </a>
            <a className="contact-method" href={siteConfig.mailHref}>
              <span className="contact-method__icon">✉️</span>
              <span>
                <span className="contact-method__label">Email us</span>
                <span className="contact-method__value">
                  {siteConfig.email}
                </span>
              </span>
            </a>
          </div>
        </div>

        {submitted ? (
          <div className="success">
            <div className="success__icon">✓</div>
            <h3 className="success__title">Thanks, {sentName}!</h3>
            <p className="success__text">
              We got your request and we&apos;ll be in touch soon with your free
              quote.
            </p>
          </div>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              Name
              <input
                value={form.name}
                onChange={setField('name')}
                placeholder="Your name"
              />
            </label>
            <div className="form__row">
              <label className="field">
                Phone
                <input
                  value={form.phone}
                  onChange={setField('phone')}
                  placeholder="Phone number"
                />
              </label>
              <label className="field">
                Email
                <input
                  value={form.email}
                  onChange={setField('email')}
                  placeholder="Email address"
                />
              </label>
            </div>
            <label className="field">
              What do you need?
              <textarea
                value={form.message}
                onChange={setField('message')}
                placeholder="e.g. attic insulation for a 2-storey house, some mold I'm worried about..."
                rows="4"
              />
            </label>
            <button className="btn btn--primary form__submit" type="submit">
              Request my free quote
            </button>
            <p className="form__note">
              No obligation. We&apos;ll only use your info to send your quote.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
