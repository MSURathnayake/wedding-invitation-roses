import React, { useMemo, useState } from 'react';
import CONFIG from '../config.js';
import { asset } from '../utils.js';

/* Points evenly spaced along a heart outline, normalised to 0..1 inside its bounding box. */
function heartPoints(n) {
  const raw = [];
  const STEPS = 600;
  for (let i = 0; i <= STEPS; i++) {
    const t = (i / STEPS) * Math.PI * 2;
    raw.push([
      16 * Math.sin(t) ** 3,
      13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t),
    ]);
  }
  const cum = [0];
  for (let i = 1; i < raw.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
  }
  const total = cum[cum.length - 1];
  const xs = raw.map((p) => p[0]);
  const ys = raw.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const norm = ([x, y]) => ({ x: (x - minX) / (maxX - minX), y: 1 - (y - minY) / (maxY - minY) });
  const pts = [];
  let idx = 0;
  for (let k = 0; k < n; k++) {
    const target = (total * k) / n;
    while (cum[idx] < target) idx++;
    pts.push(norm(raw[idx]));
  }
  const outline = raw.filter((_, i) => i % 6 === 0).map(norm);
  return { pts, outline, aspect: (maxY - minY) / (maxX - minX) };
}

// tiny deterministic pseudo-random so the left and right panel copies match exactly
const rand = (i, s) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const SPRITES = [1, 2, 4, 5, 1, 4];

function HeartArt({ guestName, burst }) {
  const { roses, path, h } = useMemo(() => {
    const N = 30;
    const { pts, outline, aspect } = heartPoints(N);
    const h = aspect + 0.14; // container height / width
    const offset = (h - 0.84 * aspect) / 2;
    const pos = (p) => ({ left: 8 + p.x * 84, top: ((offset + p.y * 0.84 * aspect) / h) * 100 });
    const roses = pts.map((p, i) => {
      let dx = p.x - 0.5, dy = (p.y - 0.5) * aspect;
      const len = Math.hypot(dx, dy) || 1;
      const big = i % 3 === 0;
      return {
        ...pos(p),
        size: (big ? 17 : 13) + rand(i, 1) * 4, // % of heart width
        rot: Math.round(rand(i, 2) * 360),
        sprite: SPRITES[i % SPRITES.length],
        dx: (dx / len) * (95 + rand(i, 3) * 40),
        dy: (dy / len) * (95 + rand(i, 4) * 40),
        spin: (rand(i, 5) - 0.5) * 360,
        delay: Math.round(((Math.atan2(dy, dx) + Math.PI) / (Math.PI * 2)) * 260 + rand(i, 6) * 120),
      };
    });
    const path = outline
      .map((p, i) => {
        const q = pos(p);
        return `${i ? 'L' : 'M'}${q.left.toFixed(2)} ${(q.top * h).toFixed(2)}`;
      })
      .join(' ');
    return { roses, path, h };
  }, []);

  return (
    <div className={`cover-art ${burst ? 'is-burst' : ''}`}>
      <p className="cover-eyebrow">The Wedding Of</p>

      <div className="heart" style={{ aspectRatio: `1 / ${h}` }}>
        <svg className="heart-line" viewBox={`0 0 100 ${h * 100}`} preserveAspectRatio="none" aria-hidden="true">
          <path d={path} pathLength="1" />
        </svg>

        {roses.map((r, i) => (
          <span
            key={i}
            className="rose"
            style={{
              left: `${r.left}%`,
              top: `${r.top}%`,
              width: `${r.size}%`,
              '--r': `${r.rot}deg`,
              '--dx': `${r.dx}vmax`,
              '--dy': `${r.dy}vmax`,
              '--spin': `${r.spin}deg`,
              '--delay': `${r.delay}ms`,
              '--pop': `${300 + i * 45}ms`,
            }}
          >
            <img src={asset(`rose${r.sprite}.png`)} alt="" draggable="false" />
          </span>
        ))}

        <div className="heart-names">
          <span className="hn-name">{CONFIG.bride}</span>
          <span className="hn-and">and</span>
          <span className="hn-name">{CONFIG.groom}</span>
        </div>
      </div>

      {guestName ? (
        <p className="cover-guest">
          <span>Dear</span> {guestName}
        </p>
      ) : (
        <p className="cover-guest cover-guest--empty">&nbsp;</p>
      )}
    </div>
  );
}

export default function Cover({ guestName, onTap, onOpened, onGone }) {
  const [stage, setStage] = useState('idle'); // idle -> burst -> open -> done

  const tap = () => {
    if (stage !== 'idle') return;
    onTap?.();
    setStage('burst');
    setTimeout(() => setStage("open"), 1300);
    setTimeout(() => onOpened?.(), 1800);
    setTimeout(() => {
      setStage('done');
      onGone?.();
    }, 3500);
  };

  if (stage === 'done') return null;

  return (
    <div
      className={`cover cover--${stage}`}
      onClick={tap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && tap()}
      aria-label="Tap to open the invitation"
    >
      <div className="cover-panel cover-panel--l">
        <div className="cover-inner">
          <HeartArt guestName={guestName} burst={stage !== 'idle'} />
        </div>
      </div>
      <div className="cover-panel cover-panel--r" aria-hidden="true">
        <div className="cover-inner">
          <HeartArt guestName={guestName} burst={stage !== 'idle'} />
        </div>
      </div>

      <div className="cover-hint">
        <span className="cover-btn">Tap to open</span>
      </div>
    </div>
  );
}
