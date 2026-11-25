import React from 'react';
import { useNow, useReveal, weddingDate } from '../utils.js';

const pad = (n) => String(n).padStart(2, '0');

export default function Countdown() {
  const ref = useReveal();
  const now = useNow(1000);
  const diff = Math.max(0, weddingDate.getTime() - now);
  const s = Math.floor(diff / 1000);
  const parts = [
    ['Days', Math.floor(s / 86400)],
    ['Hours', Math.floor((s % 86400) / 3600)],
    ['Minutes', Math.floor((s % 3600) / 60)],
    ['Seconds', s % 60],
  ];

  return (
    <section className="section countdown reveal" ref={ref}>
      <h2 className="h2">Counting Down</h2>
      <span className="gold-rule" />
      {diff > 0 ? (
        <div className="cd-grid">
          {parts.map(([label, v]) => (
            <div className="cd-box" key={label}>
              <span className="cd-num">{label === 'Days' ? v : pad(v)}</span>
              <span className="cd-label">{label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="cd-done">The day has arrived — thank you for celebrating with us.</p>
      )}
    </section>
  );
}
