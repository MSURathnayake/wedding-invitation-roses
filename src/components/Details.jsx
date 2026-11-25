import React from 'react';
import CONFIG from '../config.js';
import { dateParts, downloadIcs, timeText, useReveal } from '../utils.js';

export default function Details() {
  const ref = useReveal();
  const d = dateParts();
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.venue.mapsQuery)}`;

  return (
    <section className="section details reveal" ref={ref}>
      <h2 className="h2">The Celebration</h2>
      <span className="gold-rule" />

      <div className="date-card">
        <p className="dc-weekday">{d.weekday}</p>
        <p className="dc-big">{d.day}</p>
        <p className="dc-month">
          {d.month} {d.year}
        </p>
      </div>

      <ol className="timeline">
        {CONFIG.events.map((e) => {
          const t = new Date(e.time);
          return (
            <li key={e.title}>
              <span className="tl-time">{timeText(t)}</span>
              <span className="tl-body">
                <strong>{e.title}</strong>
                <em>{e.place}</em>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="venue-card">
        <p className="vc-label">Venue</p>
        <h3 className="vc-name">{CONFIG.venue.name}</h3>
        <p className="vc-address">{CONFIG.venue.address}</p>
        <div className="btn-row">
          <a className="btn" href={maps} target="_blank" rel="noreferrer">
            Open in Maps
          </a>
          <button className="btn btn--ghost" onClick={downloadIcs}>
            Add to calendar
          </button>
        </div>
      </div>
    </section>
  );
}
