/**
 * physics.js — Logika pergerakan pesawat
 *
 * Mengatur state pesawat (posisi, arah, kecepatan, bank)
 * dan kamera pengikut, serta trail asap dan ripple efek.
 *
 * World-space: 2600 x 1700 piksel (WW x WH).
 */

import { STATIONS } from './data.js';
import { chime }    from './audio.js';

// ── Dimensi dunia ──────────────────────────────────────────────
export const WW = 2600;
export const WH = 1700;

// ── State pesawat ──────────────────────────────────────────────
export const P = {
  x:    WW / 2,
  y:    WH / 2,
  a:   -Math.PI / 4,   // heading (radian)
  v:    0,             // kecepatan
  bank: 0              // kemiringan sayap (−1..1)
};

// ── Kamera ────────────────────────────────────────────────────
export const cam = { x: P.x, y: P.y };

// ── Trail asap & efek ripple ──────────────────────────────────
export const trail   = [];
export const ripples = [];

// ── State interaksi ────────────────────────────────────────────
export let keys    = {};
export let ptr     = null;   // posisi pointer terakhir {x,y}
export let ptrT    = 0;      // timestamp pointer terakhir
export let auto    = null;   // station tujuan auto-pilot
export let active  = null;   // station yang sedang aktif
export let started = false;  // apakah pengguna sudah berinteraksi

// Referensi elemen UI (diisi oleh main.js)
export let cardEl = null;
export let hintEl = null;

export function setCardEl(el) { cardEl = el; }
export function setHintEl(el) { hintEl = el; }

/** Tandai bahwa pengguna sudah mulai berinteraksi. */
export function touchInput() {
  auto = null;
  if (!started) {
    started = true;
    if (hintEl) hintEl.style.opacity = 0;
  }
}

// ── Helper matematika ──────────────────────────────────────────
const mod  = (a, b) => ((a % b) + b) % b;
const norm = a => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * Satu langkah simulasi fisika.
 * @param {number} dt - delta time dalam detik
 */
export function step(dt) {
  const kb =
    keys.arrowleft || keys.arrowright ||
    keys.arrowup   || keys.arrowdown  ||
    keys.a || keys.d || keys.w || keys.s;

  let turn   = 0;
  let target = null;
  let sp     = 0;

  if (kb) {
    // ── Kontrol keyboard ──────────────────────────────────────
    turn = ((keys.arrowright || keys.d) ? 1 : 0) -
           ((keys.arrowleft  || keys.a) ? 1 : 0);
    sp   = (keys.arrowdown || keys.s) ? 120 :
           (keys.arrowup   || keys.w) ? 460 : 280;
    P.a += turn * 3 * dt;

  } else if (auto) {
    // ── Auto-pilot menuju station ─────────────────────────────
    target = Math.atan2(auto.y - P.y, auto.x - P.x);
    sp     = Math.hypot(auto.x - P.x, auto.y - P.y) < 90 ? 70 : 420;

  } else if (ptr && performance.now() - ptrT < 4000) {
    // ── Ikuti pointer ─────────────────────────────────────────
    const wx = ptr.x + cam.x - (window._vpW || window.innerWidth)  / 2;
    const wy = ptr.y + cam.y - (window._vpH || window.innerHeight) / 2;
    const d  = Math.hypot(wx - P.x, wy - P.y);
    target   = Math.atan2(wy - P.y, wx - P.x);
    sp       = Math.min(520, 60 + d * 1.4);

  } else {
    sp = 180;
  }

  // ── Putar ke target ───────────────────────────────────────────
  if (target !== null) {
    const d = norm(target - P.a);
    const m = 3.4 * dt;
    const t = Math.max(-m, Math.min(m, d));
    P.a  += t;
    turn  = t / (3.4 * dt);
  }

  // ── Tolak dari batas dunia ────────────────────────────────────
  const margin = 140;
  if (P.x < margin || P.x > WW - margin || P.y < margin || P.y > WH - margin) {
    const d = norm(Math.atan2(WH / 2 - P.y, WW / 2 - P.x) - P.a);
    P.a += Math.max(-4 * dt, Math.min(4 * dt, d));
  }

  // ── Update kecepatan, posisi, bank ────────────────────────────
  P.v    += (sp - P.v) * Math.min(1, dt * 2.5);
  P.x    += Math.cos(P.a) * P.v * dt;
  P.y    += Math.sin(P.a) * P.v * dt;
  P.bank += (turn - P.bank) * Math.min(1, dt * 8);

  // ── Kamera pengikut ───────────────────────────────────────────
  cam.x += (P.x - cam.x) * Math.min(1, dt * 4);
  cam.y += (P.y - cam.y) * Math.min(1, dt * 4);

  // ── Trail asap ────────────────────────────────────────────────
  trail.push({ x: P.x - Math.cos(P.a) * 16, y: P.y - Math.sin(P.a) * 16, l: 1 });
  trail.forEach(t => t.l -= dt * 0.7);
  while (trail.length && trail[0].l <= 0) trail.shift();

  // ── Ripples ───────────────────────────────────────────────────
  ripples.forEach(r => r.r += dt * 320);
  while (ripples.length && ripples[0].r > 420) ripples.shift();

  // ── Deteksi station terdekat ──────────────────────────────────
  let near = null;
  STATIONS.forEach(s => {
    if (Math.hypot(s.x - P.x, s.y - P.y) < 120) near = s;
  });

  if (near !== active) {
    active = near;
    if (near) {
      ripples.push({ x: near.x, y: near.y, r: 90, c: near.color });
      chime(STATIONS.indexOf(near));
      if (cardEl) {
        cardEl.style.setProperty('--c', near.color);
        cardEl.innerHTML = near.html;
        cardEl.classList.add('on');
      }
      if (auto === near) auto = null;
    } else {
      if (cardEl) cardEl.classList.remove('on');
    }
  }
}

// ── Ekspos setter untuk pointer & keys ────────────────────────
export function setPtr(val)  { ptr  = val; }
export function setPtrT(val) { ptrT = val; }
export function setKey(k, v) { keys[k] = v; }
export function setAuto(s)   { auto = s; }
