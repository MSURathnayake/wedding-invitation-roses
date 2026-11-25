import React from 'react';
import CONFIG from '../config.js';
import { asset, dateParts, timeText } from '../utils.js';

export default function Hero({ guestName, guest, live }) {
  const d = dateParts();
  const rsvpLine =
    guest &&
    (guest.attending === 'yes'
      ? `Your RSVP: attending · ${guest.adults} adult${guest.adults > 1 ? 's' : ''}${
          guest.children ? ` + ${guest.children} child${guest.children > 1 ? 'ren' : ''}` : ''
        }`
      : 'Your RSVP: unable to attend');

  return (
    <header className={`hero ${live ? 'is-live' : ''}`}>
      {guestName && (
        <div className="hero-welcome">
          <p className="hw-small">{guest ? 'Welcome back' : 'Dear'}</p>
          <p className="hw-name">{guestName}</p>
          {rsvpLine && <p className="hw-rsvp">{rsvpLine}</p>}
        </div>
      )}

      <div className="wreath">
        <img src={asset('wreath.jpg')} alt="" className="wreath-img" />
        <div className="wreath-names">
          <h1 className="wn-name">{CONFIG.bride}</h1>
          <span className="wn-and">and</span>
          <h1 className="wn-name">{CONFIG.groom}</h1>
        </div>
      </div>

      <p className="hero-tag">{CONFIG.tagline}</p>

      <div className="hero-date">
        <span className="hd-month">{d.month}</span>
        <div className="hd-row">
          <span className="hd-side">{d.weekday}</span>
          <span className="hd-day">{d.day}</span>
          <span className="hd-side">at {timeText()}</span>
        </div>
        <span className="hd-year">{d.year}</span>
      </div>

      <p className="hero-place">{CONFIG.venue.name}</p>
      <p className="hero-script">{CONFIG.receptionNote}</p>

      <div className="scroll-cue" aria-hidden="true">
        <span />
      </div>
    </header>
  );
}
