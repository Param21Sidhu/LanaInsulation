import { useState } from 'react';
import { faqs } from '../data.js';

export default function Faq() {
  // Match the original: the first question starts open.
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) =>
    setOpenIndex((current) => (current === index ? -1 : index));

  return (
    <section id="faq" className="faq">
      <div className="faq__head">
        <span className="eyebrow">FAQ</span>
        <h2 className="section-title">Good questions, answered</h2>
      </div>
      <div className="faq__list">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.q} className="faq-item">
              <button
                type="button"
                className="faq-item__q"
                aria-expanded={isOpen}
                onClick={() => toggle(index)}
              >
                {faq.q}
                <span className={isOpen ? 'faq-item__icon is-open' : 'faq-item__icon'}>
                  +
                </span>
              </button>
              {isOpen && <div className="faq-item__a">{faq.a}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
