import React, { useState } from 'react';
import CONFIG from '../config.js';
import { api, titleCase, useReveal } from '../utils.js';

function Stepper({ label, hint, value, min, max, onChange }) {
  return (
    <div className="stepper">
      <div>
        <span className="st-label">{label}</span>
        {hint && <span className="st-hint">{hint}</span>}
      </div>
      <div className="st-ctl">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Fewer ${label}`}>−</button>
        <output>{value}</output>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label={`More ${label}`}>+</button>
      </div>
    </div>
  );
}

function Summary({ guest, onEdit }) {
  const yes = guest.attending === 'yes';
  return (
    <div className="rsvp-done">
      <div className="rd-heart">♥</div>
      <h3 className="rd-title">{yes ? `Thank you, ${guest.name}!` : `Thank you for letting us know, ${guest.name}`}</h3>
      <p className="rd-text">
        {yes
          ? 'Your response has been recorded — we can’t wait to celebrate with you.'
          : 'We’ll miss you on the day, and we’re grateful for your wishes.'}
      </p>
      <dl className="rd-list">
        <div><dt>Response</dt><dd>{yes ? 'Joyfully attending' : 'Unable to attend'}</dd></div>
        {yes && (
          <div>
            <dt>Guests</dt>
            <dd>
              {guest.adults} adult{guest.adults > 1 ? 's' : ''}
              {guest.children ? ` · ${guest.children} child${guest.children > 1 ? 'ren' : ''}` : ''}
            </dd>
          </div>
        )}
        <div><dt>Phone</dt><dd>{guest.phone}</dd></div>
        {guest.message && <div><dt>Your wish</dt><dd>“{guest.message}”</dd></div>}
      </dl>
      <button className="btn btn--ghost" onClick={onEdit}>Change my response</button>
    </div>
  );
}

export default function Rsvp({ guest, setGuest, urlName }) {
  const ref = useReveal();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => ({
    name: guest?.name || urlName || '',
    phone: guest?.phone || '',
    attending: guest?.attending || 'yes',
    adults: guest?.adults || 1,
    children: guest?.children || 0,
    message: guest?.message || '',
  }));
  const [status, setStatus] = useState('idle'); // idle | sending | error
  const [error, setError] = useState('');
  const [lookupOpen, setLookupOpen] = useState(false);
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupMsg, setLookupMsg] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const name = titleCase(form.name);
    const digits = form.phone.replace(/\D/g, '');
    if (name.length < 2) return setError('Please enter your name.');
    if (digits.length < 9) return setError('Please enter a valid phone / WhatsApp number.');
    setError('');
    setStatus('sending');
    const record = {
      name,
      phone: form.phone.trim(),
      attending: form.attending,
      adults: form.attending === 'yes' ? form.adults : 0,
      children: form.attending === 'yes' ? form.children : 0,
      message: form.message.trim(),
    };
    try {
      await api.saveRsvp(record);
      setGuest({ ...record, savedAt: Date.now() });
      setEditing(false);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setError('Sorry, we couldn’t send your response. Please check your connection and try again.');
    }
  };

  const doLookup = async (e) => {
    e.preventDefault();
    setLookupMsg('Looking…');
    try {
      const res = await api.lookup(lookupPhone);
      if (res.found) {
        setGuest(res.guest);
        setForm((f) => ({ ...f, ...res.guest }));
        setLookupOpen(false);
        setLookupMsg('');
      } else {
        setLookupMsg('We couldn’t find a response for that number.');
      }
    } catch {
      setLookupMsg('Lookup failed — please try again.');
    }
  };

  const showSummary = guest && !editing;

  return (
    <section className="section rsvp reveal" ref={ref} id="rsvp">
      <h2 className="h2">RSVP</h2>
      <span className="gold-rule" />
      <p className="section-lead">Kindly let us know if you can join us.</p>

      <div className="card">
        {showSummary ? (
          <Summary guest={guest} onEdit={() => setEditing(true)} />
        ) : (
          <form onSubmit={submit} noValidate>
            <label className="field">
              <span>Your name</span>
              <input value={form.name} onChange={set('name')} autoComplete="name" placeholder="e.g. Kamal Silva" />
            </label>
            <label className="field">
              <span>Phone / WhatsApp</span>
              <input value={form.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="+94 77 123 4567" />
            </label>

            <div className="choice">
              <button type="button" className={form.attending === 'yes' ? 'on' : ''} onClick={() => setForm((f) => ({ ...f, attending: 'yes' }))}>
                Joyfully accept
              </button>
              <button type="button" className={form.attending === 'no' ? 'on' : ''} onClick={() => setForm((f) => ({ ...f, attending: 'no' }))}>
                Regretfully decline
              </button>
            </div>

            {form.attending === 'yes' && (
              <div className="steppers">
                <Stepper label="Adults" hint="including you" value={form.adults} min={1} max={CONFIG.maxGuestsPerAdultsField} onChange={(v) => setForm((f) => ({ ...f, adults: v }))} />
                <Stepper label="Children" hint="under 12" value={form.children} min={0} max={10} onChange={(v) => setForm((f) => ({ ...f, children: v }))} />
              </div>
            )}

            <label className="field">
              <span>A wish for the couple <em>(optional)</em></span>
              <textarea rows={3} value={form.message} onChange={set('message')} placeholder="Write your wishes…" />
            </label>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button className="btn btn--solid btn--block" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : guest ? 'Update response' : 'Send RSVP'}
            </button>
            {guest && (
              <button type="button" className="link" onClick={() => setEditing(false)}>Cancel</button>
            )}
          </form>
        )}
      </div>

      {!guest && (
        <div className="lookup">
          {!lookupOpen ? (
            <button className="link" onClick={() => setLookupOpen(true)}>Already replied from another phone?</button>
          ) : (
            <form onSubmit={doLookup} className="lookup-form">
              <input value={lookupPhone} onChange={(e) => setLookupPhone(e.target.value)} inputMode="tel" placeholder="Phone number you used" />
              <button className="btn btn--sm">Find</button>
              {lookupMsg && <p>{lookupMsg}</p>}
            </form>
          )}
        </div>
      )}

      {api.demo && <p className="demo-note">Demo mode — responses are stored only in this browser until the Apps Script URL is added.</p>}
    </section>
  );
}
