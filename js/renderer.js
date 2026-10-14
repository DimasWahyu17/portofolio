/**
 * renderer.js — Rendering canvas 2D
 *
 * Menggambar:
 *   - Latar gradient langit
 *   - Bintang berkedip (parallax)
 *   - Awan transparan (parallax)
 *   - Border dunia
 *   - Station (aura, cincin, titik, label)
 *   - Efek ripple
 *   - Trail asap pesawat
 *   - Pesawat 2D fallback (jika Three.js tidak ada)
 *   - Minimap
 */

import { STATIONS }             from './data.js';
import { WW, WH, P, cam, trail, ripples, active } from './physics.js';

// ── Dimensi viewport (diupdate dari main.js) ──────────────────
let w = 0;
let h = 0;

export function setViewport(width, height) {
  w = width;
  h = height;
}

// ── Seed awal untuk PRNG deterministik ────────────────────────
const rnd = (() => {
  let s = 7;
  return () => (s = s * 16807 % 2147483647) / 2147483647;
})();

// ── Asset statis (dibuat sekali) ───────────────────────────────
export const stars = Array.from({ length: 150 }, () => ({
  x: rnd(), y: rnd(),
  r: rnd() * 1.6 + 0.3,
  p: rnd() * 0.2 + 0.05,
  t: rnd() * 6
}));

export const clouds = Array.from({ length: 16 }, () => ({
  x: rnd(), y: rnd(),
  s: rnd() * 70 + 50,
  p: rnd() * 0.35 + 0.35
}));

const mod = (a, b) => ((a % b) + b) % b;

/**
 * Gambar satu frame ke canvas 2D.
 * @param {CanvasRenderingContext2D} g  - context 2D
 * @param {number}                   t  - timestamp (ms)
 * @param {boolean}                  has3D - apakah Three.js aktif
 */
export function draw(g, t, has3D) {

  // ── Latar langit (gradient) ─────────────────────────────────
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0,   '#0b1230');
  gr.addColorStop(0.7, '#2b2a6b');
  gr.addColorStop(1,   '#6a4a8f');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);

  const TW = w + 240;
  const TH = h + 240;

  // ── Bintang berkedip (parallax) ─────────────────────────────
  stars.forEach(s => {
    const x = mod(s.x * TW - cam.x * s.p, TW) - 120;
    const y = mod(s.y * TH - cam.y * s.p, TH) - 120;
    g.globalAlpha = 0.4 + 0.5 * Math.sin(t / 700 + s.t) ** 2;
    g.fillStyle   = '#fff';
    g.beginPath();
    g.arc(x, y, s.r, 0, 6.3);
    g.fill();
  });
  g.globalAlpha = 1;

  // ── Awan (parallax, transparan) ─────────────────────────────
  clouds.forEach(c => {
    const x = mod(c.x * (TW + 300) - cam.x * c.p, TW + 300) - 250;
    const y = mod(c.y * (TH + 300) - cam.y * c.p, TH + 300) - 250;
    g.fillStyle = 'rgba(190,180,255,.07)';
    [[0, 0, 1], [0.8, 0.2, 0.75], [-0.8, 0.25, 0.7], [0.3, -0.3, 0.6]].forEach(q => {
      g.beginPath();
      g.ellipse(x + q[0] * c.s, y + q[1] * c.s, c.s * q[2] * 1.3, c.s * q[2] * 0.6, 0, 0, 6.3);
      g.fill();
    });
  });

  // ── Koordinat dunia ─────────────────────────────────────────
  g.save();
  g.translate(w / 2 - cam.x, h / 2 - cam.y);

  // Border dunia
  g.strokeStyle = 'rgba(255,255,255,.08)';
  g.setLineDash([8, 12]);
  g.lineWidth = 2;
  g.strokeRect(60, 60, WW - 120, WH - 120);
  g.setLineDash([]);

  // ── Station ─────────────────────────────────────────────────
  STATIONS.forEach(s => {
    const on    = s === active;
    const pulse = Math.sin(t / 500 + s.x) * 6;

    // Aura
    g.fillStyle = s.color + '22';
    g.beginPath();
    g.arc(s.x, s.y, 110 + pulse + (on ? 20 : 0), 0, 6.3);
    g.fill();

    // Cincin berputar
    g.strokeStyle    = s.color;
    g.lineWidth      = on ? 4 : 2;
    g.setLineDash([10, 10]);
    g.lineDashOffset = -t / 60;
    g.beginPath();
    g.arc(s.x, s.y, 90, 0, 6.3);
    g.stroke();
    g.setLineDash([]);

    // Titik tengah
    g.fillStyle = s.color;
    g.beginPath();
    g.arc(s.x, s.y, 12, 0, 6.3);
    g.fill();

    // Label
    g.font      = '800 26px "Bricolage Grotesque",sans-serif';
    g.textAlign = 'center';
    g.fillText(s.label, s.x, s.y - 128);
  });

  // ── Ripple efek ─────────────────────────────────────────────
  ripples.forEach(r => {
    g.globalAlpha = Math.max(0, 1 - (r.r - 90) / 330);
    g.strokeStyle = r.c;
    g.lineWidth   = 4;
    g.beginPath();
    g.arc(r.x, r.y, r.r, 0, 6.3);
    g.stroke();
  });
  g.globalAlpha = 1;

  // ── Trail asap ───────────────────────────────────────────────
  for (let i = 1; i < trail.length; i++) {
    const a = trail[i - 1];
    const b = trail[i];
    g.strokeStyle = `rgba(255,235,190,${b.l * 0.55})`;
    g.lineWidth   = 1 + b.l * 5;
    g.lineCap     = 'round';
    g.beginPath();
    g.moveTo(a.x, a.y);
    g.lineTo(b.x, b.y);
    g.stroke();
  }

  // ── Pesawat (koordinat lokal) ────────────────────────────────
  g.translate(P.x, P.y);
  g.rotate(P.a);

  // Bayangan
  g.fillStyle = 'rgba(0,0,0,.25)';
  g.beginPath();
  g.ellipse(-6, 22, 20, 6, 0, 0, 6.3);
  g.fill();

  // Fallback 2D jika Three.js tidak aktif
  if (!has3D) {
    const bk = Math.max(-1, Math.min(1, P.bank)) * 0.45;
    const sy = 1 - Math.abs(bk) * 0.4;
    g.scale(1, sy);

    g.fillStyle = '#f2f4ff';
    g.beginPath();
    g.moveTo(26, 0); g.lineTo(-18, -16); g.lineTo(-9, 0); g.lineTo(-18, 16);
    g.closePath(); g.fill();

    g.fillStyle = '#c9ccf0';
    g.beginPath();
    g.moveTo(26, 0); g.lineTo(-9, 0); g.lineTo(-18, 16);
    g.closePath(); g.fill();

    g.fillStyle = '#ffd166';
    g.beginPath();
    g.moveTo(-9, 0); g.lineTo(-18, -16); g.lineTo(-13, 0);
    g.closePath(); g.fill();
  }

  g.restore();

  // ── Minimap ─────────────────────────────────────────────────
  const mw = 120;
  const mh = mw * WH / WW;
  const mx = w - mw - 16;
  const my = 16;

  g.fillStyle = 'rgba(14,19,50,.6)';
  g.fillRect(mx, my, mw, mh);

  STATIONS.forEach(s => {
    g.fillStyle = s.color;
    g.beginPath();
    g.arc(mx + s.x / WW * mw, my + s.y / WH * mh, 3, 0, 6.3);
    g.fill();
  });

  g.fillStyle = '#fff';
  g.beginPath();
  g.arc(mx + P.x / WW * mw, my + P.y / WH * mh, 3.5, 0, 6.3);
  g.fill();
}
