/**
 * physics.js — Logika pergerakan pesawat
 *
 * Mengatur state pesawat (posisi, arah, kecepatan, bank)
 * dan kamera pengikut, serta trail asap dan ripple efek.
 *
 * BARU: pesawat bisa MENDARAT (docked) di station. Saat mendarat,
 * pesawat berputar pelan di sekitar station dan kartu isi tetap
 * terbuka sampai pengunjung memilih "Lanjut terbang".
 *
 * World-space: 2600 x 1700 piksel (WW x WH).
 */

import { STATIONS } from './data.js';
import { chime }    from './audio.js';

// ── Dimensi dunia ──────────────────────────────────────────────
export const WW = 2600;
export const WH = 1700;

// ── Pengaturan kecepatan ───────────────────────────────────────
// 0.6 = pelan (default), 1 = cepat. Diubah lewat tombol di main.js.
export let SPD = 0.6;
export function getSpd()      { return SPD; }
export function toggleSpeed() { SPD = SPD < 1 ? 1 : 0.6; return SPD < 1; } // true = mode pelan

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
export let active  = null;   // station yang sedang aktif (= station tempat mendarat)
export let started = false;  // apakah pengguna sudah berinteraksi

// ── State mendarat ─────────────────────────────────────────────
export let docked = null;    // station tempat pesawat sedang mendarat
let ignore = null;           // station yang baru ditinggalkan (tidak langsung mendarat lagi)
let th = 0;                  // sudut orbit saat mendarat
let rr = 0;                  // radius orbit saat ini

export function isDocked() { return docked; }

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
const norm = a => Math.atan2(Math.sin(a), Math.cos(a));

// ── Mendarat & lepas landas ────────────────────────────────────
function dock(s) {
  docked = s;
  active = s;
  auto   = null;
  th = Math.atan2(P.y - s.y, P.x - s.x);
  rr = Math.hypot(P.x - s.x, P.y - s.y);

  ripples.push({ x: s.x, y: s.y, r: 90, c: s.color });
  chime(STATIONS.indexOf(s));

  if (cardEl) {
    cardEl.style.setProperty('--c', s.color);
    cardEl.innerHTML =
      `<p class="st">Mendarat · ${s.label}</p>` + s.html +
      `<button class="go" type="button">Lanjut terbang ✈</button>`;
    cardEl.scrollTop = 0;
    cardEl.classList.add('on');
    const btn = cardEl.querySelector('.go');
    if (btn) btn.onclick = undock;
  }
}

/** Lepas landas dari station. Aman dipanggil kapan saja. */
export function undock() {
  if (!docked) return;
  ignore = docked;
  P.a = th + Math.PI / 2;      // arah singgung orbit
  P.v = 110 * SPD;
  docked = null;
  active = null;
  if (cardEl) cardEl.classList.remove('on');
}

/**
 * Satu langkah simulasi fisika.
 * @param {number} dt - delta time dalam detik
 */
export function step(dt) {
  const kb =
    keys.arrowleft || keys.arrowright ||
    keys.arrowup   || keys.arrowdown  ||
    keys.a || keys.d || keys.w || keys.s;

  if (docked) {
    // ── Mode mendarat: berputar pelan mengelilingi station ────
    th += 0.8 * dt;
    rr += (88 - rr) * Math.min(1, dt * 3);
    P.x = docked.x + Math.cos(th) * rr;
    P.y = docked.y + Math.sin(th) * rr;
    P.a = th + Math.PI / 2;
    P.v = 70;
    P.bank += (0.45 - P.bank) * Math.min(1, dt * 6);

  } else {
    // ── Mode terbang ──────────────────────────────────────────
    const TR = SPD < 1 ? 2.6 : 3.4;   // kecepatan belok
    let turn   = 0;
    let target = null;
    let sp     = 0;

    if (kb) {
      turn = ((keys.arrowright || keys.d) ? 1 : 0) -
             ((keys.arrowleft  || keys.a) ? 1 : 0);
      sp   = (keys.arrowdown || keys.s) ? 120 :
             (keys.arrowup   || keys.w) ? 460 : 280;
      P.a += turn * TR * dt;

    } else if (auto) {
      target = Math.atan2(auto.y - P.y, auto.x - P.x);
      sp     = Math.hypot(auto.x - P.x, auto.y - P.y) < 200 ? 120 : 420;

    } else if (ptr && performance.now() - ptrT < 4000) {
      const wx = ptr.x + cam.x - (window._vpW || window.innerWidth)  / 2;
      const wy = ptr.y + cam.y - (window._vpH || window.innerHeight) / 2;
      const d  = Math.hypot(wx - P.x, wy - P.y);
      target   = Math.atan2(wy - P.y, wx - P.x);
      sp       = Math.min(520, 60 + d * 1.4);

    } else {
      sp = 180;
    }

    sp *= SPD;

    if (target !== null) {
      const d = norm(target - P.a);
      const m = TR * dt;
      const t = Math.max(-m, Math.min(m, d));
      P.a  += t;
      turn  = t / (TR * dt);
    }

    // Tolak dari batas dunia
    const margin = 140;
    if (P.x < margin || P.x > WW - margin || P.y < margin || P.y > WH - margin) {
      const d = norm(Math.atan2(WH / 2 - P.y, WW / 2 - P.x) - P.a);
      P.a += Math.max(-4 * dt, Math.min(4 * dt, d));
    }

    P.v    += (sp - P.v) * Math.min(1, dt * 2.5);
    P.x    += Math.cos(P.a) * P.v * dt;
    P.y    += Math.sin(P.a) * P.v * dt;
    P.bank += (turn - P.bank) * Math.min(1, dt * 8);
  }

  // ── Kamera pengikut ───────────────────────────────────────────
  // Saat mendarat, kamera fokus ke station (bukan ke pesawat yang berputar)
  // dan digeser supaya station tidak tertutup kartu.
  const vw = window._vpW || window.innerWidth;
  const vh = window._vpH || window.innerHeight;
  let cx = P.x, cy = P.y;
  if (docked) {
    cx = docked.x + (vw > 640 ? Math.min(180, vw * 0.1) : 0);
    cy = docked.y + (vw <= 640 ? vh * 0.18 : 0);
  }
  cam.x += (cx - cam.x) * Math.min(1, dt * 4);
  cam.y += (cy - cam.y) * Math.min(1, dt * 4);

  // ── Trail asap ────────────────────────────────────────────────
  trail.push({ x: P.x - Math.cos(P.a) * 16, y: P.y - Math.sin(P.a) * 16, l: 1 });
  trail.forEach(t => t.l -= dt * 0.7);
  while (trail.length && trail[0].l <= 0) trail.shift();

  // ── Ripples ───────────────────────────────────────────────────
  ripples.forEach(r => r.r += dt * 320);
  while (ripples.length && ripples[0].r > 420) ripples.shift();

  // ── Deteksi station terdekat → mendarat ───────────────────────
  if (!docked) {
    let near = null;
    STATIONS.forEach(s => {
      if (Math.hypot(s.x - P.x, s.y - P.y) < 120) near = s;
    });
    if (near && near !== ignore) dock(near);
    if (ignore && Math.hypot(ignore.x - P.x, ignore.y - P.y) > 180) ignore = null;
  }
}

// ── Ekspos setter untuk pointer & keys ────────────────────────
export function setPtr(val)  { ptr  = val; }
export function setPtrT(val) { ptrT = val; }
export function setKey(k, v) { keys[k] = v; }
export function setAuto(s)   { auto = s; }
