import React from 'react';
import CONFIG from '../config.js';
import { useReveal } from '../utils.js';

const pretty = (p) => p.replace(/^\+94/, '0').replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');

export default function Contacts() {
  const ref = useReveal();
  return (
    <section className="section contacts reveal" ref={ref}>
      <h2 className="h2">Get in Touch</h2>
      <span className="gold-rule" />
      <p className="section-lead">Questions about the day? Reach out to us.</p>
      <div className="contact-grid">
        {CONFIG.contacts.map((c) => (
          <article className="contact-card" key={c.role}>
            <p className="cc-role">{c.role}</p>
            <h3 className="cc-name">{c.name}</h3>
            <p className="cc-phone">{pretty(c.phone)}</p>
            <div className="btn-row">
              <a className="btn btn--sm" href={`tel:${c.phone}`}>Call</a>
              <a className="btn btn--sm btn--ghost" href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
