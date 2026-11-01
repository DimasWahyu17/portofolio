/**
 * main.js - Entry point & game loop
 */

import { STATIONS }                           from './data.js';
import { initAudio, audioStep, toggleMute }   from './audio.js';
import { init3D, resize3D, render3D, renderer3 } from './plane3d.js';
import {
  step, P, cam,
  setPtr, setPtrT, setKey, setAuto, setCardEl, setHintEl,
  touchInput, undock, isDocked, toggleSpeed, getSpd
} from './physics.js';
import { draw, setViewport } from './renderer.js';

// ── Canvas 2D ──────────────────────────────────────────────────
const cv = document.getElementById('c');
const g  = cv.getContext('2d');

// ── Elemen UI ──────────────────────────────────────────────────
const cardEl = document.getElementById('card');
const hintEl = document.getElementById('hint');
const navEl  = document.getElementById('nav');

setCardEl(cardEl);
setHintEl(hintEl);

// ── Viewport & DPR ─────────────────────────────────────────────
let w, h, dpr;

function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  w   = innerWidth;
  h   = innerHeight;

  window._vpW = w;
  window._vpH = h;

  // Canvas 2D: set pixel buffer DAN CSS size secara eksplisit
  cv.width        = w * dpr;
  cv.height       = h * dpr;
  cv.style.width  = w + 'px';
  cv.style.height = h + 'px';
  g.setTransform(dpr, 0, 0, dpr, 0, 0);

  setViewport(w, h);

  // resize3D hanya berjalan jika renderer3 sudah ada (window resize)
  resize3D(dpr, w, h);
}

addEventListener('resize', resize);
resize(); // ukur viewport; Three.js belum ada di sini

// ── Inisialisasi Three.js ───────────────────────────────────────
// init3D sekarang menerima dpr agar bisa langsung setSize di dalam.
init3D(dpr, w, h);

// ── Event listener ──────────────────────────────────────────────
addEventListener('pointermove', e => {
  setPtr({ x: e.clientX, y: e.clientY });
  setPtrT(performance.now());
  touchInput();
});

addEventListener('pointerdown', e => {
  initAudio();
  // Ketuk langit saat mendarat = lepas landas
  if (isDocked() && e.target === cv) undock();
  setPtr({ x: e.clientX, y: e.clientY });
  setPtrT(performance.now());
  touchInput();
});

addEventListener('keydown', e => {
  initAudio();
  // Tombol gerak / Esc saat mendarat = lepas landas
  if (isDocked() && (e.key.startsWith('Arrow') || e.key === 'Escape' ||
      ['w', 'a', 's', 'd'].includes(e.key.toLowerCase()))) undock();
  setKey(e.key.toLowerCase(), 1);
  if (e.key.startsWith('Arrow')) e.preventDefault();
  touchInput();
});

addEventListener('keyup', e => {
  setKey(e.key.toLowerCase(), 0);
});

// ── Tombol navigasi station ─────────────────────────────────────
STATIONS.forEach(s => {
  const b = document.createElement('button');
  b.textContent = s.label;
  b.id = `nav-${s.id}`;
  b.onclick = () => {
    initAudio();
    undock();
    setAuto(s);
    if (hintEl) hintEl.style.opacity = 0;
    setPtr(null);
    b.blur();
  };
  navEl.appendChild(b);
});

// ── Tombol mute ─────────────────────────────────────────────────
const sb = document.createElement('button');
sb.id          = 'btn-mute';
sb.textContent = '🔊 Suara';
sb.onclick = () => {
  initAudio();
  const isMuted = toggleMute();
  sb.textContent = isMuted ? '🔇 Suara' : '🔊 Suara';
  sb.blur();
};
navEl.appendChild(sb);

// ── Tombol kecepatan ────────────────────────────────────────────
const vb = document.createElement('button');
vb.id          = 'btn-speed';
vb.textContent = '🐢 Pelan';
vb.onclick = () => {
  const slow = toggleSpeed();
  vb.textContent = slow ? '🐢 Pelan' : '🚀 Cepat';
  vb.blur();
};
navEl.appendChild(vb);

// ── Game loop ───────────────────────────────────────────────────
let last = performance.now();

function loop(t) {
  const dt = Math.min(0.05, (t - last) / 1000);
  last = t;

  step(dt);
  draw(g, t, !!renderer3);
  audioStep(P.v / getSpd());

  if (renderer3) {
    render3D(P.x, P.y, cam.x, cam.y, P.a, P.bank, t);
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);