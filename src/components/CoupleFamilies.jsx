import React from 'react';
import CONFIG from '../config.js';
import { asset, useReveal } from '../utils.js';

export default function CoupleFamilies() {
  const r1 = useReveal();
  const r2 = useReveal();
  return (
    <>
      <section className="section couple reveal" ref={r1}>
        <p className="eyebrow">Together with their families</p>
        <figure className="photo-arch">
          <img src={asset(CONFIG.couplePhoto)} alt={`${CONFIG.bride} and ${CONFIG.groom}`} />
        </figure>
        <p className="couple-note">{CONFIG.coupleNote}</p>
      </section>

      <section className="section families reveal" ref={r2}>
        <h2 className="h2">Our Families</h2>
        <span className="gold-rule" />
        <div className="family-grid">
          {CONFIG.families.map((f) => (
            <article className="family-card" key={f.side}>
              <p className="fc-side">{f.side}</p>
              <h3 className="fc-name">{f.name}</h3>
              <p className="fc-line">{f.line}</p>
              <p className="fc-parents">{f.parents}</p>
              {f.place && <p className="fc-place">{f.place}</p>}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
