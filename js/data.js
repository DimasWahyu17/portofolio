/**
 * data.js — Isi portofolio Anda
 *
 * PANDUAN EDIT:
 * - AVATAR : URL atau data URI base64 foto Anda.
 *            Biarkan string kosong ('') untuk menampilkan inisial.
 * - INISIAL: Dua huruf yang muncul jika AVATAR kosong.
 * - STATIONS: Array section portofolio yang tersebar di langit.
 *   Setiap objek memiliki:
 *     id     — identifier unik (string)
 *     label  — teks tombol navigasi
 *     x, y   — posisi di world-space (0–2600 / 0–1700)
 *     color  — warna aksen section (hex)
 *     html   — konten HTML yang ditampilkan di info card
 */

// ── Foto & inisial ────────────────────────────────────────────
export const AVATAR  = '';   // Contoh: 'https://i.pravatar.cc/150'
export const INISIAL = 'NA';

// ── Section-section portofolio ────────────────────────────────
export const STATIONS = [
  {
    id: 'tentang',
    label: 'Tentang',
    x: 760, y: 520,
    color: '#ffd166',
    html: `
      <div class="av" ${AVATAR ? `style="background-image:url('${AVATAR}')"` : ''}>
        ${AVATAR ? '' : INISIAL}
      </div>
      <h2>Tentang saya</h2>
      <p>Halo! Saya Dimas Wahyu, developer dari Jawa Tengah.
         Saya membuat website dan aplikasi yang rapi, cepat, dan punya karakter.</p>
      <p>Di luar kode: kopi, fotografi, dan kereta api.</p>
    `
  },
  {
    id: 'proyek',
    label: 'Proyek',
    x: 1750, y: 440,
    color: '#7ae0d0',
    html: `
      <h2>Proyek</h2>
      <ul>
        <li><b>Toko Kopi Lokal</b> — e-commerce untuk UMKM, React + Node.</li>
        <li><b>Catatan Harian</b> — aplikasi jurnal offline-first.</li>
        <li><b>Peta Desa</b> — peta interaktif data kependudukan.</li>
      </ul>
    `
  },
  {
    id: 'keahlian',
    label: 'Keahlian',
    x: 1850, y: 1180,
    color: '#ff8fab',
    html: `
      <h2>Keahlian</h2>
      <div class="chips">
        <span>JavaScript</span><span>React</span><span>Node.js</span>
        <span>CSS</span><span>Canvas</span><span>Figma</span><span>SQL</span>
      </div>
    `
  },
  {
    id: 'pengalaman',
    label: 'Pengalaman',
    x: 1300, y: 300,
    color: '#ffb86b',
    html: `
      <h2>Pengalaman</h2>
      <ul>
        <li><b>Frontend Developer</b>, PT Contoh Digital (2024–sekarang)</li>
        <li><b>Freelance Web Developer</b> (2022–2024)</li>
        <li><b>Magang Web</b>, Studio Kreatif (2021)</li>
      </ul>
    `
  },
  {
    id: 'sertifikat',
    label: 'Sertifikat',
    x: 1330, y: 1390,
    color: '#9be564',
    html: `
      <h2>Sertifikat</h2>
      <ul>
        <li>Meta Front-End Developer</li>
        <li>Google UX Design</li>
        <li>Dicoding: Belajar Dasar Pemrograman Web</li>
      </ul>
    `
  },
  {
    id: 'kontak',
    label: 'Kontak',
    x: 820, y: 1230,
    color: '#b69cff',
    html: `
      <h2>Kontak</h2>
      <p>Punya ide atau butuh website? Ayo ngobrol.</p>
      <p><a href="mailto:email@anda.com">email@anda.com</a></p>
      <p>
        <a href="https://github.com/" target="_blank" rel="noopener">GitHub</a> ·
        <a href="https://linkedin.com/" target="_blank" rel="noopener">LinkedIn</a>
      </p>
    `
  }
];
