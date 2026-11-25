import React, { useRef, useState } from 'react';
import CONFIG from '../config.js';
import { api, compressImage, fmt, unlockedByUrl, useNow, useReveal } from '../utils.js';

const opensAt = new Date(CONFIG.uploadOpensAt);

export default function PhotoUpload({ guestName }) {
  const ref = useReveal();
  const now = useNow(30000);
  const open = now >= opensAt.getTime() || unlockedByUrl();
  const input = useRef(null);
  const [name, setName] = useState(guestName || '');
  const [items, setItems] = useState([]); // {id, thumb, state}
  const [busy, setBusy] = useState(false);

  const onFiles = async (e) => {
    const files = [...e.target.files].filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    for (const file of files) {
      const id = Math.random().toString(36).slice(2);
      setItems((l) => [{ id, thumb: URL.createObjectURL(file), state: 'uploading' }, ...l]);
      try {
        const { base64 } = await compressImage(file);
        await api.upload({ name: name.trim() || guestName || 'Guest', filename: file.name.replace(/\.\w+$/, '') + '.jpg', mime: 'image/jpeg', data: base64 });
        setItems((l) => l.map((x) => (x.id === id ? { ...x, state: 'done' } : x)));
      } catch {
        setItems((l) => l.map((x) => (x.id === id ? { ...x, state: 'error' } : x)));
      }
    }
    setBusy(false);
  };

  return (
    <section className="section upload reveal" ref={ref}>
      <h2 className="h2">Share Your Photos</h2>
      <span className="gold-rule" />

      {!open ? (
        <div className="card upload-locked">
          <div className="lock">🔒</div>
          <p className="ul-title">Opens on our wedding day</p>
          <p className="ul-text">
            From {fmt(opensAt, { day: 'numeric', month: 'long', year: 'numeric' })} you can upload the photos you take —
            funny, candid or heartfelt. They’ll stay open for you afterwards too.
          </p>
        </div>
      ) : (
        <div className="card">
          <p className="section-lead" style={{ marginTop: 0 }}>
            Captured a special moment? Add your photos to our memories.
          </p>
          <label className="field">
            <span>Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="So we know who to thank" />
          </label>
          <input ref={input} type="file" accept="image/*" multiple hidden onChange={onFiles} />
          <button className="btn btn--solid btn--block" onClick={() => input.current.click()} disabled={busy}>
            {busy ? 'Uploading…' : 'Choose photos'}
          </button>

          {items.length > 0 && (
            <ul className="up-grid">
              {items.map((it) => (
                <li key={it.id} className={`up-${it.state}`}>
                  <img src={it.thumb} alt="" />
                  <span>{it.state === 'done' ? '✓' : it.state === 'error' ? '!' : '…'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
