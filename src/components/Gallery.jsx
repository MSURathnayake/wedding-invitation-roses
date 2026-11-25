import React, { useCallback, useEffect, useRef, useState } from 'react';
import CONFIG from '../config.js';
import { asset, useReveal } from '../utils.js';

export default function Gallery() {
  const reveal = useReveal();
  const track = useRef(null);
  const paused = useRef(false);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const photos = CONFIG.gallery;

  const goTo = useCallback((i) => {
    const el = track.current;
    if (!el) return;
    const idx = (i + photos.length) % photos.length;
    const item = el.children[idx];
    el.scrollTo({ left: item.offsetLeft - (el.clientWidth - item.clientWidth) / 2, behavior: 'smooth' });
  }, [photos.length]);

  const onScroll = () => {
    const el = track.current;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0, bestD = Infinity;
    [...el.children].forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.clientWidth / 2 - center);
      if (d < bestD) { bestD = d; best = i; }
    });
    setActive(best);
  };

  // gentle auto-slide, stops once the guest interacts
  useEffect(() => {
    const id = setInterval(() => {
      if (!paused.current) goTo(active + 1);
    }, 3800);
    return () => clearInterval(id);
  }, [active, goTo]);

  // desktop mouse drag
  useEffect(() => {
    const el = track.current;
    let down = false, startX = 0, startL = 0;
    const md = (e) => { down = true; paused.current = true; startX = e.pageX; startL = el.scrollLeft; el.classList.add('dragging'); };
    const mm = (e) => { if (down) el.scrollLeft = startL - (e.pageX - startX); };
    const mu = () => { if (!down) return; down = false; el.classList.remove('dragging'); onScroll(); goTo(active); };
    el.addEventListener('mousedown', md);
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    return () => {
      el.removeEventListener('mousedown', md);
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
    };
  });

  const nudge = (dir) => { paused.current = true; goTo(active + dir); };

  return (
    <section className="section gallery reveal" ref={reveal}>
      <h2 className="h2">Our Moments</h2>
      <span className="gold-rule" />

      <div className="g-wrap">
        <div className="g-track" ref={track} onScroll={onScroll} onTouchStart={() => (paused.current = true)}>
          {photos.map((p, i) => (
            <button
              key={p}
              className={`g-item ${i === active ? 'is-active' : ''}`}
              onClick={() => i === active ? setLightbox(p) : (paused.current = true, goTo(i))}
              aria-label={`Photo ${i + 1}`}
            >
              <img src={asset(p)} alt="" loading="lazy" draggable="false" />
            </button>
          ))}
        </div>
        <button className="g-arrow g-arrow--l" onClick={() => nudge(-1)} aria-label="Previous photo">‹</button>
        <button className="g-arrow g-arrow--r" onClick={() => nudge(1)} aria-label="Next photo">›</button>
      </div>

      <div className="g-dots">
        {photos.map((_, i) => (
          <button key={i} className={i === active ? 'on' : ''} onClick={() => nudge(i - active)} aria-label={`Go to photo ${i + 1}`} />
        ))}
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img src={asset(lightbox)} alt="" />
          <button aria-label="Close">×</button>
        </div>
      )}
    </section>
  );
}
