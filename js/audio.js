/**
 * audio.js — Web Audio API (tanpa file eksternal)
 *
 * Menghasilkan suara mesin pesawat dan chime saat mendekati station.
 * AudioContext baru dibuat hanya setelah ada interaksi pengguna
 * (pointer / keyboard) agar sesuai browser autoplay policy.
 */

let AC      = null;
let eng     = null;
let engG    = null;
let windG   = null;
export let muted = false;

/**
 * Inisialisasi AudioContext dan node-node osilator.
 * Aman dipanggil berkali-kali; hanya berjalan sekali.
 */
export function initAudio() {
  if (AC) {
    AC.resume && AC.resume();
    return;
  }

  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();

    // ── Mesin (sawtooth + lowpass) ──────────────────────────────
    eng = AC.createOscillator();
    eng.type = 'sawtooth';

    const f = AC.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 380;

    engG = AC.createGain();
    engG.gain.value = 0;

    eng.connect(f);
    f.connect(engG);
    engG.connect(AC.destination);
    eng.start();

    // ── Angin (noise buffer + bandpass) ────────────────────────
    const buf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    const n  = AC.createBufferSource();
    n.buffer = buf;
    n.loop   = true;

    const bf = AC.createBiquadFilter();
    bf.type  = 'bandpass';
    bf.frequency.value = 900;

    windG = AC.createGain();
    windG.gain.value = 0;

    n.connect(bf);
    bf.connect(windG);
    windG.connect(AC.destination);
    n.start();

  } catch (e) {
    AC = null;
  }
}

/**
 * Perbarui volume mesin dan angin setiap frame.
 * @param {number} speed - kecepatan pesawat saat ini (P.v)
 */
export function audioStep(speed) {
  if (!AC) return;
  const t = AC.currentTime;
  const m = muted ? 0 : 1;
  const r = speed / 520;

  eng.frequency.setTargetAtTime(48 + speed * 0.14, t, 0.1);
  engG.gain.setTargetAtTime(m * (0.02 + r * 0.03), t, 0.1);
  windG.gain.setTargetAtTime(m * r * 0.05, t, 0.1);
}

/**
 * Mainkan efek chime 3-nada saat mendekati station.
 * @param {number} i - indeks station (menentukan pitch)
 */
export function chime(i) {
  if (!AC || muted) return;
  const t = AC.currentTime;

  [0, 4, 7].forEach((n, k) => {
    const o  = AC.createOscillator();
    const v  = AC.createGain();
    const s0 = t + k * 0.09;

    o.type = 'sine';
    o.frequency.value = 440 * Math.pow(2, (i * 2 + n) / 12);

    v.gain.setValueAtTime(0, s0);
    v.gain.linearRampToValueAtTime(0.08, s0 + 0.02);
    v.gain.exponentialRampToValueAtTime(0.001, s0 + 0.7);

    o.connect(v);
    v.connect(AC.destination);
    o.start(s0);
    o.stop(s0 + 0.8);
  });
}

/**
 * Toggle mute on/off.
 * @returns {boolean} nilai muted baru
 */
export function toggleMute() {
  muted = !muted;
  return muted;
}
