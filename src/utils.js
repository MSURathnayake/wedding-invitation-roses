import { useEffect, useRef, useState } from 'react';
import CONFIG from './config';

export const asset = (p) => `${import.meta.env.BASE_URL}assets/${p}`;

export const weddingDate = new Date(CONFIG.weddingDate);

export function fmt(date, opts) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: CONFIG.timeZone, ...opts }).format(date);
}
export const dateParts = (d = weddingDate) => ({
  weekday: fmt(d, { weekday: 'long' }),
  day: fmt(d, { day: 'numeric' }),
  month: fmt(d, { month: 'long' }),
  year: fmt(d, { year: 'numeric' }),
});
export const timeText = (d = weddingDate) =>
  fmt(d, { hour: 'numeric', minute: '2-digit', hour12: true }).replace(':00', '').toUpperCase();

export function titleCase(s = '') {
  return s
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/* ---------- returning-guest memory (this browser) ---------- */
const KEY = 'wedding_guest_v1';
export function loadGuest() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}
export function saveGuest(g) {
  try {
    localStorage.setItem(KEY, JSON.stringify(g));
  } catch {
    /* private mode — ignore */
  }
}
export function guestNameFromUrl() {
  try {
    const p = new URLSearchParams(window.location.search);
    return titleCase(p.get('to') || p.get('guest') || '');
  } catch {
    return '';
  }
}
export const unlockedByUrl = () => {
  try {
    return new URLSearchParams(window.location.search).has('unlock');
  } catch {
    return false;
  }
};

/* ---------- hooks ---------- */
export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('in');
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('in');
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

/* ---------- Google Apps Script backend ---------- */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const DEMO_KEY = 'wedding_demo_rsvps_v1';

async function callScript(payload) {
  const res = await fetch(CONFIG.appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Request failed');
  return json;
}

export const api = {
  demo: !CONFIG.appsScriptUrl,

  async saveRsvp(data) {
    if (this.demo) {
      await delay(800);
      return { ok: true };
    }
    return callScript({ action: 'rsvp', ...data });
  },

  async lookup(phone) {
    if (this.demo) {
      await delay(500);
      const g = loadGuest();
      const digits = (s) => (s || '').replace(/\D/g, '').slice(-9);
      return g && digits(g.phone) === digits(phone) ? { ok: true, found: true, guest: g } : { ok: true, found: false };
    }
    return callScript({ action: 'lookup', phone });
  },

  async upload({ name, filename, mime, data }) {
    if (this.demo) {
      await delay(600);
      return { ok: true };
    }
    return callScript({ action: 'upload', name, filename, mime, data });
  },
};

/* ---------- image compression for uploads ---------- */
export function compressImage(file, max = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      const dataUrl = c.toDataURL('image/jpeg', quality);
      URL.revokeObjectURL(url);
      resolve({ dataUrl, base64: dataUrl.split(',')[1] });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
}

/* ---------- calendar file ---------- */
export function downloadIcs() {
  const toIcs = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const start = weddingDate;
  const end = new Date(start.getTime() + 5 * 3600 * 1000);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding//EN',
    'BEGIN:VEVENT',
    `UID:${start.getTime()}@wedding`,
    `DTSTAMP:${toIcs(new Date())}`,
    `DTSTART:${toIcs(start)}`,
    `DTEND:${toIcs(end)}`,
    `SUMMARY:Wedding of ${CONFIG.bride} & ${CONFIG.groom}`,
    `LOCATION:${CONFIG.venue.name}, ${CONFIG.venue.address}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'wedding.ics';
  a.click();
}
